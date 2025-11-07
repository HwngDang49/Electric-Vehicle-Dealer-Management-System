using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Common.Paging;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Quotes.GetQuotes
{
    public sealed class GetQuotesHandler : IRequestHandler<GetQuotesQuery, PagedResult<GetQuotesDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetQuotesHandler(EVDmsDbContext db, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedResult<GetQuotesDto>> Handle(GetQuotesQuery query, CancellationToken ct)
        {
            var now = DateTime.UtcNow;
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            var branchId = _httpContextAccessor.HttpContext!.User.GetBranchId();
            var userId = _httpContextAccessor.HttpContext!.User.GetUserId();
            
            // Auto-expire quotes that are past LockedUntil
            await AutoExpireQuotesAsync(dealerId, now, ct);
            
            var quotesQuery = _db.Quotes.AsNoTracking()
            .Where(q => q.DealerId == dealerId);
            
            // Filter theo BranchId và CreatedBy nếu user có branch
            if (branchId.HasValue)
            {
                quotesQuery = quotesQuery.Where(q => q.BranchId == branchId.Value);
                
                // Nếu user có userId, chỉ lấy data do user đó tạo
                if (userId.HasValue)
                {
                    quotesQuery = quotesQuery.Where(q => q.CreatedBy == userId.Value);
                }
            }

            // Lọc Status nếu có
            if (!string.IsNullOrWhiteSpace(query.Status))
                quotesQuery = quotesQuery.Where(q => q.Status == query.Status);

            // Lọc Expired nếu có:
            // - expired = true  -> Finalized && locked_until < now
            // - expired = false -> NOT (Finalized && locked_until < now)
            if (query.Expired.HasValue)
            {
                if (query.Expired.Value)
                {
                    quotesQuery = quotesQuery.Where(q =>
                        q.Status == QuoteStatus.Finalized.ToString() &&
                        q.LockedUntil != null &&
                        q.LockedUntil < now);
                }
                else
                {
                    quotesQuery = quotesQuery.Where(q =>
                        !(q.Status == QuoteStatus.Finalized.ToString() &&
                          q.LockedUntil != null &&
                          q.LockedUntil < now));
                }
            }

            // Search
            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                var kw = query.SearchTerm.Trim();
                if (long.TryParse(kw, out var idLike))
                {
                    quotesQuery = quotesQuery.Where(q => q.QuoteId == idLike);
                }
                else
                {
                    quotesQuery = quotesQuery.Where(q =>
                        (q.Customer.FullName != null && q.Customer.FullName.Contains(kw)) ||
                        (q.Customer.Phone != null && q.Customer.Phone.Contains(kw)) ||
                        (q.Customer.Email != null && q.Customer.Email.Contains(kw)));
                }
            }

            var total = await quotesQuery.CountAsync(ct);
            var skip = query.Page <= 1 ? 0 : (query.Page - 1) * query.PageSize;

            var items = await quotesQuery
                .Include(q => q.Customer)              // include customer for name/phone/email
                .Include(q => q.QuoteItems)            // include items
                    .ThenInclude(qi => qi.Product)     // include product for model/variant/color
                .OrderByDescending(sd => sd.CreatedAt)
                .Skip(skip).Take(query.PageSize)
                .ProjectTo<GetQuotesDto>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            // Tính IsExpired ở memory cho chắc (dùng cùng logic trên)
            // Convert DateTime từ UTC sang giờ VN cho tất cả items
            foreach (var x in items)
            {
                x.IsExpired = x.Status == QuoteStatus.Finalized.ToString() && x.LockedUntil.HasValue && now > x.LockedUntil.Value;
                // Convert CreatedAt và LockedUntil sang VN time
                x.CreatedAt = DateTimeHelper.ToVietnamTime(x.CreatedAt);
                if (x.LockedUntil.HasValue)
                {
                    x.LockedUntil = DateTimeHelper.ToVietnamTime(x.LockedUntil.Value);
                }
            }

            return PagedResult<GetQuotesDto>.Create(items, query.Page, query.PageSize, total);
        }

        /// <summary>
        /// Auto-expire quotes that have passed their LockedUntil date
        /// - Status must be "Draft"
        /// - LockedUntil must be set
        /// - LockedUntil must be in the past
        /// </summary>
        private async Task AutoExpireQuotesAsync(long dealerId, DateTime now, CancellationToken ct)
        {
            var branchId = _httpContextAccessor.HttpContext?.User.GetBranchId();
            var userId = _httpContextAccessor.HttpContext?.User.GetUserId();
            
            var expiredQuotesQuery = _db.Quotes
                .Where(q => 
                    q.DealerId == dealerId &&
                    q.Status == QuoteStatus.Draft.ToString() &&
                    q.LockedUntil != null &&
                    q.LockedUntil < now);
            
            // Filter theo BranchId và CreatedBy nếu user có branch
            if (branchId.HasValue)
            {
                expiredQuotesQuery = expiredQuotesQuery.Where(q => q.BranchId == branchId.Value);
                
                // Nếu user có userId, chỉ expire quotes do user đó tạo
                if (userId.HasValue)
                {
                    expiredQuotesQuery = expiredQuotesQuery.Where(q => q.CreatedBy == userId.Value);
                }
            }
            
            var expiredQuotes = await expiredQuotesQuery.ToListAsync(ct);

            if (expiredQuotes.Any())
            {
                foreach (var quote in expiredQuotes)
                {
                    quote.Status = QuoteStatus.Expired.ToString();
                    quote.UpdatedAt = now;
                }
                
                await _db.SaveChangesAsync(ct);
            }
        }
    }
}
