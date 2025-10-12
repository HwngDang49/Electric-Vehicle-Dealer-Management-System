using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Constants;
using backend.Common.Paging;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Quotes.GetQuotes
{
    public sealed class GetQuotesHandler : IRequestHandler<GetQuotesQuery, PagedResult<GetQuotesDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public GetQuotesHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db; _mapper = mapper;
        }

        public async Task<PagedResult<GetQuotesDto>> Handle(GetQuotesQuery query, CancellationToken ct)
        {
            var quotesQuery = _db.SalesDocuments.AsNoTracking()
                .Where(sd => sd.DealerId == query.DealerId && sd.DocType == DocTypes.Quote);

            if (!string.IsNullOrWhiteSpace(query.Status))
                quotesQuery = quotesQuery.Where(sd => sd.Status == query.Status);

            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                var kw = query.SearchTerm.Trim();
                // cho phép gõ số id hoặc text tên/sđt/email khách
                if (long.TryParse(kw, out var idLike))
                    quotesQuery = quotesQuery.Where(sd => sd.SalesDocId == idLike);
                else
                    quotesQuery = quotesQuery.Where(sd =>
                        (sd.Customer.FullName != null && sd.Customer.FullName.Contains(kw)) ||
                        (sd.Customer.Phone != null && sd.Customer.Phone.Contains(kw)) ||
                        (sd.Customer.Email != null && sd.Customer.Email.Contains(kw)));
            }

            var total = await quotesQuery.CountAsync(ct);
            var skip = query.Page <= 1 ? 0 : (query.Page - 1) * query.PageSize;

            var items = await quotesQuery
                .OrderByDescending(sd => sd.CreatedAt)
                .Skip(skip).Take(query.PageSize)
                .ProjectTo<GetQuotesDto>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return PagedResult<GetQuotesDto>.Create(items, query.Page, query.PageSize, total);
        }
    }
}
