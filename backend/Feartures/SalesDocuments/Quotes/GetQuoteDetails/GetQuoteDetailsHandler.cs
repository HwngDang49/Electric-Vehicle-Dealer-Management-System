using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Common.Exceptions;
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

            var dto = await _dbContext.Quotes
                .AsNoTracking()
                .Where(q =>
                    q.QuoteId == query.QuoteId &&
                    q.DealerId == dealerId) // **Sử dụng dealerId vừa lấy để kiểm tra**
                .ProjectTo<GetQuoteDetailDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (dto is null)
                throw new NotFoundException($"Quote with ID #{query.QuoteId} was not found.");

            // tính IsExpired sau khi materialize
            dto.IsExpired = dto.LockedUntil.HasValue && DateTime.UtcNow > dto.LockedUntil.Value;

            return dto;
        }
    }
}
