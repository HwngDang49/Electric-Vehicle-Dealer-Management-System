using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.GetVehicleSalesStatistics;

public sealed class GetVehicleSalesStatisticsHandler : IRequestHandler<GetVehicleSalesStatisticsQuery, GetVehicleSalesStatisticsResponse>
{
    private readonly EVDmsDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetVehicleSalesStatisticsHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<GetVehicleSalesStatisticsResponse> Handle(GetVehicleSalesStatisticsQuery request, CancellationToken ct)
    {
        var userRole = _httpContextAccessor.HttpContext!.User.GetRole();
        
        // Chỉ Admin mới có thể xem thống kê
        if (userRole != Role.Admin.ToString())
        {
            throw new UnauthorizedAccessException("Chỉ Admin mới có thể xem thống kê bán hàng");
        }

        var now = DateTime.UtcNow;
        var year = now.Year;
        var month = now.Month;
        
        IQueryable<OrderItem> orderItemsQuery = _db.OrderItems
            .AsNoTracking()
            .Include(oi => oi.Order)
            .Include(oi => oi.Product);

        // Lấy dữ liệu tháng hiện tại
        var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var lastDayOfMonth = startDate.AddMonths(1).AddDays(-1);
        var endDate = new DateTime(lastDayOfMonth.Year, lastDayOfMonth.Month, lastDayOfMonth.Day, 23, 59, 59, DateTimeKind.Utc);
        var periodLabel = $"{year}-{month:D2}";

        // Filter order items by order date range
        orderItemsQuery = orderItemsQuery.Where(oi => 
            oi.Order.CreatedAt >= startDate && oi.Order.CreatedAt <= endDate);

        // Group by product and calculate statistics
        var statistics = await orderItemsQuery
            .GroupBy(oi => new { oi.ProductId, oi.Product.Name, oi.Product.ModelCode })
            .Select(g => new VehicleSalesStatistic
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                ModelCode = g.Key.ModelCode,
                TotalQuantity = g.Sum(oi => oi.Qty)
            })
            .OrderByDescending(s => s.TotalQuantity)
            .ToListAsync(ct);

        // Calculate percentage
        var totalQuantity = statistics.Sum(s => s.TotalQuantity);
        if (totalQuantity > 0)
        {
            foreach (var stat in statistics)
            {
                stat.Percentage = Math.Round((decimal)stat.TotalQuantity / totalQuantity * 100, 2);
            }
        }

        return new GetVehicleSalesStatisticsResponse
        {
            Statistics = statistics,
            Period = "month",
            PeriodLabel = periodLabel
        };
    }
}

