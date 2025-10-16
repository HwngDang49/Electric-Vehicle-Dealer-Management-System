using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
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
            var quotesQuery = _db.SalesDocuments.AsNoTracking()
            .Where(sd => sd.DealerId == dealerId && sd.DocType == DocTypeEnum.Quote.ToString());

            // Lọc Status nếu có
            if (!string.IsNullOrWhiteSpace(query.Status))
                quotesQuery = quotesQuery.Where(sd => sd.Status == query.Status);

            // Lọc Expired nếu có:
            // - expired = true  -> Finalized && locked_until < now
            // - expired = false -> NOT (Finalized && locked_until < now)
            if (query.Expired.HasValue)
            {
                if (query.Expired.Value)
                {
                    quotesQuery = quotesQuery.Where(sd =>
                        sd.Status == QuoteStatus.Finalized.ToString() &&
                        sd.LockedUntil != null &&
                        sd.LockedUntil < now);
                }
                else
                {
                    quotesQuery = quotesQuery.Where(sd =>
                        !(sd.Status == QuoteStatus.Finalized.ToString() &&
                          sd.LockedUntil != null &&
                          sd.LockedUntil < now));
                }
            }

            // Search
            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                var kw = query.SearchTerm.Trim();
                if (long.TryParse(kw, out var idLike))
                {
                    quotesQuery = quotesQuery.Where(sd => sd.SalesDocId == idLike);
                }
                else
                {
                    quotesQuery = quotesQuery.Where(sd =>
                        (sd.Customer.FullName != null && sd.Customer.FullName.Contains(kw)) ||
                        (sd.Customer.Phone != null && sd.Customer.Phone.Contains(kw)) ||
                        (sd.Customer.Email != null && sd.Customer.Email.Contains(kw)));
                }
            }

            var total = await quotesQuery.CountAsync(ct);
            var skip = query.Page <= 1 ? 0 : (query.Page - 1) * query.PageSize;

            var items = await quotesQuery
                .OrderByDescending(sd => sd.CreatedAt)
                .Skip(skip).Take(query.PageSize)
                .ProjectTo<GetQuotesDto>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            // Tính IsExpired ở memory cho chắc (dùng cùng logic trên)
            foreach (var x in items)
                x.IsExpired = x.Status == QuoteStatus.Finalized.ToString() && x.LockedUntil.HasValue && now > x.LockedUntil.Value;

            return PagedResult<GetQuotesDto>.Create(items, query.Page, query.PageSize, total);
        }
    }
}
