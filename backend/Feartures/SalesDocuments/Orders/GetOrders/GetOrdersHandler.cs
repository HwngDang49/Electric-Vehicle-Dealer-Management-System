using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Common.Paging;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.GetOrders;

public sealed class GetOrdersHandler : IRequestHandler<GetOrdersQuery, PagedResult<GetOrdersListItemDto>>
{
    private readonly EVDmsDbContext _db;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;
    public GetOrdersHandler(EVDmsDbContext db, IMapper mapper, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<PagedResult<GetOrdersListItemDto>> Handle(GetOrdersQuery request, CancellationToken ct)
    {
        var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

        var ordersQuery = _db.Orders
            .AsNoTracking()
            // **Luôn luôn lọc theo dealerId của user đang đăng nhập**
            .Where(o => o.DealerId == dealerId);

        // Áp dụng bộ lọc Status
        if (!string.IsNullOrWhiteSpace(request.Status))
            ordersQuery = ordersQuery.Where(o => o.Status == request.Status);

        // Áp dụng bộ lọc ngày tạo
        if (request.CreatedFrom.HasValue)
            ordersQuery = ordersQuery.Where(o => o.CreatedAt.Date >= request.CreatedFrom.Value.Date);

        if (request.CreatedTo.HasValue)
            ordersQuery = ordersQuery.Where(o => o.CreatedAt.Date <= request.CreatedTo.Value.Date);

        // Áp dụng bộ lọc tìm kiếm (đã bỏ ContractNo)
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.Trim();
            if (long.TryParse(searchTerm, out var searchId))
            {
                ordersQuery = ordersQuery.Where(o => o.OrderId == searchId);
            }
            else
            {
                ordersQuery = ordersQuery.Where(o =>
                    (o.Customer.FullName.Contains(searchTerm)) ||
                    (o.Customer.Phone != null && o.Customer.Phone.Contains(searchTerm)) ||
                    (o.Customer.Email != null && o.Customer.Email.Contains(searchTerm)));
            }
        }

        // Lấy tổng số bản ghi trước khi phân trang
        var totalCount = await ordersQuery.CountAsync(ct);

        var items = await ordersQuery
            .OrderByDescending(sd => sd.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<GetOrdersListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);

        foreach (var item in items)
        {
            item.OrderCode = $"DH{item.CreatedAt:yyyyMMdd}-{item.OrderId}";
        }

        return PagedResult<GetOrdersListItemDto>.Create(items, request.Page, request.PageSize, totalCount);
    }
}