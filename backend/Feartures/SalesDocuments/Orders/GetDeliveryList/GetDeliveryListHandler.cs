using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.GetDeliveryList
{
    public class GetDeliveryListHandler : IRequestHandler<GetDeliveryListQuery, Result<DeliveryListResponse>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetDeliveryListHandler(
            EVDmsDbContext dbContext,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<DeliveryListResponse>> Handle(GetDeliveryListQuery query, CancellationToken ct)
        {
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            // Base query - orders thuộc dealer
            var ordersQuery = _dbContext.Orders
                .Include(o => o.Customer)
                .Include(o => o.Inventories)
                    .ThenInclude(i => i.Product)
                .Where(o => o.DealerId == dealerId);

            // Filter by status - Chỉ hiển thị Ready và Delivered
            if (!string.IsNullOrEmpty(query.Status) && query.Status.ToLower() != "all")
            {
                var statusFilter = query.Status.ToLower() switch
                {
                    "ready" => OrderStatus.Ready.ToString(),
                    "delivered" => OrderStatus.Delivered.ToString(),
                    _ => null
                };

                if (statusFilter != null)
                {
                    ordersQuery = ordersQuery.Where(o => o.Status == statusFilter);
                }
            }
            else
            {
                // Mặc định: Lấy orders Ready hoặc Delivered (đã lên lịch giao xe)
                ordersQuery = ordersQuery.Where(o =>
                    o.Status == OrderStatus.Ready.ToString() ||
                    o.Status == OrderStatus.Delivered.ToString());
            }

            // Get total count
            var totalCount = await ordersQuery.CountAsync(ct);

            // Get paginated data
            var orders = await ordersQuery
                .OrderByDescending(o => o.CreatedAt)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync(ct);

            // Map to DTO
            var items = orders.Select(o =>
            {
                var firstInventory = o.Inventories.FirstOrDefault();
                var product = firstInventory?.Product;

                return new DeliveryListItemDto
                {
                    OrderId = o.OrderId,
                    OrderNumber = $"ORD-{o.OrderId}",
                    Status = o.Status,

                    // Customer
                    CustomerName = o.Customer.FullName,
                    CustomerPhone = o.Customer.Phone,

                    // Vehicle
                    VehicleName = product?.Name ?? "N/A",
                    VehicleColor = product?.ColorName,
                    Vin = firstInventory?.Vin,

                    // Delivery
                    ScheduledDeliveryDate = o.ScheduledDeliveryDate,
                    DeliveryAddress = o.DeliveryAddress,
                    DeliveryContactPhone = o.DeliveryContactPhone,
                    ReceiverName = o.ReceiverName,

                    // Other
                    TotalAmount = o.TotalAmount,
                    CreatedAt = o.CreatedAt
                };
            }).ToList();

            var response = new DeliveryListResponse
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };

            return Result.Success(response);
        }
    }
}

