using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Paging;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace backend.Feartures.Customers.GetListCustomer
{
    public class GetListCustomerHandler : IRequestHandler<GetCustomersQuery, PagedResult<GetCustomersDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public GetListCustomerHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<PagedResult<GetCustomersDto>> Handle(GetCustomersQuery query, CancellationToken ct)
        {
            var baseQuery = _db.Customers.AsNoTracking()
                .Where(c => c.DealerId == query.DealerId);

            if (!string.IsNullOrWhiteSpace(query.Status))
                baseQuery = baseQuery.Where(c => c.Status == query.Status);

            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                var searchTerm = query.SearchTerm.Trim();
                baseQuery = baseQuery.Where(c =>
                    (c.FullName != null && c.FullName.Contains(searchTerm)) ||
                    (c.Phone != null && c.Phone.Contains(searchTerm)) ||
                    (c.Email != null && c.Email.Contains(searchTerm)));
            }

            var total = await baseQuery.CountAsync(ct);

            var skip = query.Page <= 1 ? 0 : (query.Page - 1) * query.PageSize;

            var items = await baseQuery
                .OrderByDescending(c => c.CreatedAt)
                .Skip(skip).Take(query.PageSize)
                .ProjectTo<GetCustomersDto>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return PagedResult<GetCustomersDto>.Create(items, query.Page, query.PageSize, total);
        }
    }
}
