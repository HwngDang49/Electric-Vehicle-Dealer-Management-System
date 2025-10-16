using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Common.Paging;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Customers.GetListCustomer
{
    public class GetListCustomerHandler
        : IRequestHandler<GetCustomersQuery, PagedResult<GetCustomersDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _http;

        public GetListCustomerHandler(EVDmsDbContext db, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _mapper = mapper;
            _http = httpContextAccessor;
        }

        public async Task<PagedResult<GetCustomersDto>> Handle(GetCustomersQuery query, CancellationToken ct)
        {
            // 1) DealerId từ JWT
            query.DealerId = _http.HttpContext!.User.GetDealerId();

            // 2) Chuẩn hóa paging (chặn PageSize quá lớn)
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 20 : Math.Min(query.PageSize, 200);
            var skip = (page - 1) * pageSize;

            // 3) Base query theo dealer
            var baseQ = _db.Customers
                .AsNoTracking()
                .Where(c => c.DealerId == query.DealerId);

            // 4) Filter Status (nếu có)
            if (!string.IsNullOrWhiteSpace(query.Status))
                baseQ = baseQ.Where(c => c.Status == query.Status);

            // 5) SearchTerm (LIKE %term%)
            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                var term = query.SearchTerm.Trim();
                var like = $"%{term}%";
                baseQ = baseQ.Where(c =>
                    (c.FullName != null && EF.Functions.Like(c.FullName, like)) ||
                    (c.Phone != null && EF.Functions.Like(c.Phone, like)) ||
                    (c.Email != null && EF.Functions.Like(c.Email, like)));
            }

            // 6) Đếm tổng
            var total = await baseQ.CountAsync(ct);

            // 7) Lấy trang
            var items = await baseQ
                .OrderByDescending(c => c.CreatedAt)
                .Skip(skip).Take(pageSize)
                .ProjectTo<GetCustomersDto>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            // 8) Trả kết quả
            return PagedResult<GetCustomersDto>.Create(items, page, pageSize, total);
        }
    }
}
