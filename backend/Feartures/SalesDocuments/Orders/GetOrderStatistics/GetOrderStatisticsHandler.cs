using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.GetOrderStatistics;

public sealed class GetOrderStatisticsHandler : IRequestHandler<GetOrderStatisticsQuery, GetOrderStatisticsResponse>
{
    private readonly EVDmsDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetOrderStatisticsHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<GetOrderStatisticsResponse> Handle(GetOrderStatisticsQuery request, CancellationToken ct)
    {
        var userRole = _httpContextAccessor.HttpContext!.User.GetRole();

        // Chỉ Admin mới có thể xem thống kê của tất cả dealers
        if (userRole != Role.Admin.ToString())
        {
            throw new UnauthorizedAccessException("Chỉ Admin mới có thể xem thống kê order của tất cả dealers");
        }

        var now = DateTime.UtcNow;
        var year = request.Year ?? now.Year;

        IQueryable<Order> ordersQuery = _db.Orders
            .AsNoTracking()
            .Include(o => o.Dealer);

        DateTime startDate;
        DateTime endDate;
        string periodLabel;

        if (request.Period == "quarter")
        {
            var quarter = request.Quarter ?? ((now.Month - 1) / 3 + 1);
            var month = (quarter - 1) * 3 + 1;
            startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var lastDayOfQuarter = startDate.AddMonths(3).AddDays(-1);
            endDate = new DateTime(lastDayOfQuarter.Year, lastDayOfQuarter.Month, lastDayOfQuarter.Day, 23, 59, 59, DateTimeKind.Utc);
            periodLabel = $"{year}-Q{quarter}";
        }
        else // month
        {
            var month = request.Month ?? now.Month;
            startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var lastDayOfMonth = startDate.AddMonths(1).AddDays(-1);
            endDate = new DateTime(lastDayOfMonth.Year, lastDayOfMonth.Month, lastDayOfMonth.Day, 23, 59, 59, DateTimeKind.Utc);
            periodLabel = $"{year}-{month:D2}";
        }

        // Filter orders by date range and status (chỉ lấy đơn hàng đã hoàn thành)
        ordersQuery = ordersQuery
            .Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate)
            .Where(o => o.Status == OrderStatus.Closed.ToString());

        // Get purchase orders for the same period (chỉ lấy đơn mua đã giao hàng)
        var purchaseOrdersQuery = _db.PurchaseOrders
            .AsNoTracking()
            .Where(po => po.CreateAt >= startDate && po.CreateAt <= endDate)
            .Where(po => po.Status == POStatus.Delivery.ToString());

        // Group orders by dealer
        var orderStats = await ordersQuery
            .GroupBy(o => new { o.DealerId, o.Dealer.Name, o.Dealer.Code })
            .Select(g => new
            {
                g.Key.DealerId,
                g.Key.Name,
                g.Key.Code,
                OrderCount = g.Count()
            })
            .ToListAsync(ct);

        // Group purchase orders by dealer
        var poStats = await purchaseOrdersQuery
            .GroupBy(po => po.DealerId)
            .Select(g => new
            {
                DealerId = g.Key,
                PurchaseOrderCount = g.Count()
            })
            .ToListAsync(ct);

        // Combine statistics
        var statistics = orderStats
            .Select(os => new DealerOrderStatistic
            {
                DealerId = os.DealerId,
                DealerName = os.Name,
                DealerCode = os.Code,
                PeriodLabel = periodLabel,
                OrderCount = os.OrderCount,
                PurchaseOrderCount = poStats.FirstOrDefault(po => po.DealerId == os.DealerId)?.PurchaseOrderCount ?? 0
            })
            .ToList();

        // Add dealers that only have purchase orders but no orders
        var dealersWithOnlyPO = poStats
            .Where(po => !orderStats.Any(os => os.DealerId == po.DealerId))
            .ToList();

        if (dealersWithOnlyPO.Any())
        {
            var dealerIds = dealersWithOnlyPO.Select(po => po.DealerId).ToList();
            var dealerInfo = await _db.Dealers
                .AsNoTracking()
                .Where(d => dealerIds.Contains(d.DealerId))
                .Select(d => new { d.DealerId, d.Name, d.Code })
                .ToListAsync(ct);

            foreach (var po in dealersWithOnlyPO)
            {
                var dealer = dealerInfo.FirstOrDefault(d => d.DealerId == po.DealerId);
                if (dealer != null)
                {
                    statistics.Add(new DealerOrderStatistic
                    {
                        DealerId = dealer.DealerId,
                        DealerName = dealer.Name,
                        DealerCode = dealer.Code,
                        PeriodLabel = periodLabel,
                        OrderCount = 0,
                        PurchaseOrderCount = po.PurchaseOrderCount
                    });
                }
            }
        }

        // Order by order count descending
        statistics = statistics
            .OrderByDescending(s => s.OrderCount)
            .ToList();

        return new GetOrderStatisticsResponse
        {
            Statistics = statistics,
            Period = request.Period,
            PeriodLabel = periodLabel
        };
    }
}

