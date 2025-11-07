using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Common.Exceptions;
using backend.Common.Helpers;
using backend.Domain.Enums;         // DocType
using backend.Feartures.SalesDocuments.Quotes.GetQuoteDetails;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.SalesDocuments.Details
{
    public sealed class GetQuoteDetailsHandler : IRequestHandler<GetQuoteByIdQuery, GetQuoteDetailDto>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetQuoteDetailsHandler(
            EVDmsDbContext dbContext,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<GetQuoteDetailDto> Handle(GetQuoteByIdQuery query, CancellationToken cancellationToken)
        {
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            var branchId = _httpContextAccessor.HttpContext!.User.GetBranchId();
            var userId = _httpContextAccessor.HttpContext!.User.GetUserId();
            var now = DateTime.UtcNow;
            
            // Auto-expire this quote if needed
            await AutoExpireSingleQuoteAsync(query.QuoteId, dealerId, now, cancellationToken);

            var quoteQuery = _dbContext.Quotes
                .AsNoTracking()
                .Include(q => q.Customer)
                .Include(q => q.QuoteItems)
                    .ThenInclude(qi => qi.Product)
                .Where(q =>
                    q.QuoteId == query.QuoteId &&
                    q.DealerId == dealerId);
            
            // Filter theo BranchId và CreatedBy nếu user có branch
            if (branchId.HasValue)
            {
                quoteQuery = quoteQuery.Where(q => q.BranchId == branchId.Value);
                
                // Nếu user có userId, chỉ lấy data do user đó tạo
                if (userId.HasValue)
                {
                    quoteQuery = quoteQuery.Where(q => q.CreatedBy == userId.Value);
                }
            }
            
            var dto = await quoteQuery
                .ProjectTo<GetQuoteDetailDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (dto is null)
                throw new NotFoundException($"Quote with ID #{query.QuoteId} was not found.");

            // tính IsExpired sau khi materialize (dùng UTC để so sánh)
            dto.IsExpired = dto.LockedUntil.HasValue && DateTime.UtcNow > dto.LockedUntil.Value;

            // Convert DateTime từ UTC sang giờ VN cho response
            dto.CreatedAt = DateTimeHelper.ToVietnamTime(dto.CreatedAt);
            dto.UpdatedAt = DateTimeHelper.ToVietnamTime(dto.UpdatedAt);
            if (dto.LockedUntil.HasValue)
            {
                dto.LockedUntil = DateTimeHelper.ToVietnamTime(dto.LockedUntil.Value);
            }

            return dto;
        }

        /// <summary>
        /// Auto-expire a single quote if it has passed its LockedUntil date
        /// </summary>
        private async Task AutoExpireSingleQuoteAsync(long quoteId, long dealerId, DateTime now, CancellationToken ct)
        {
            var branchId = _httpContextAccessor.HttpContext?.User.GetBranchId();
            var userId = _httpContextAccessor.HttpContext?.User.GetUserId();
            
            var quoteQuery = _dbContext.Quotes
                .Where(q => 
                    q.QuoteId == quoteId &&
                    q.DealerId == dealerId &&
                    q.Status == QuoteStatus.Draft.ToString() &&
                    q.LockedUntil != null &&
                    q.LockedUntil < now);
            
            // Filter theo BranchId và CreatedBy nếu user có branch
            if (branchId.HasValue)
            {
                quoteQuery = quoteQuery.Where(q => q.BranchId == branchId.Value);
                
                // Nếu user có userId, chỉ expire quotes do user đó tạo
                if (userId.HasValue)
                {
                    quoteQuery = quoteQuery.Where(q => q.CreatedBy == userId.Value);
                }
            }
            
            var quote = await quoteQuery.FirstOrDefaultAsync(ct);

            if (quote != null)
            {
                quote.Status = QuoteStatus.Expired.ToString();
                quote.UpdatedAt = now;
                await _dbContext.SaveChangesAsync(ct);
            }
        }
    }
}
