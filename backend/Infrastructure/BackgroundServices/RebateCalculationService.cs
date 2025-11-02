using backend.Domain.Entities;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.BackgroundServices
{
    /// <summary>
    /// Background service tự động tính rebate định kỳ dựa trên orders đã delivered
    /// DEMO: Chạy mỗi 2 phút | Production: Nên set 6 giờ (TimeSpan.FromHours(6))
    /// </summary>
    public class RebateCalculationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<RebateCalculationService> _logger;
        // DEMO: Set 2 phút để dễ test. Production: TimeSpan.FromHours(6)
        private readonly TimeSpan _interval = TimeSpan.FromHours(6);

        public RebateCalculationService(
            IServiceProvider serviceProvider,
            ILogger<RebateCalculationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("RebateCalculationService đã bắt đầu");

            // DEMO: Chạy ngay lần đầu tiên (không cần đợi)
            // Production: Có thể thêm delay ban đầu nếu muốn
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CalculateRebates(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi thực thi RebateCalculationService");
                }

                // Chờ interval trước khi chạy lại (2 phút cho demo, 6 giờ cho production)
                await Task.Delay(_interval, stoppingToken);
            }

            _logger.LogInformation("RebateCalculationService đã dừng");
        }

        private async Task CalculateRebates(CancellationToken ct)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<EVDmsDbContext>();

            // 1. Lấy tất cả Active agreements có rebate tiers
            var activeAgreements = await db.DealerAgreements
                .Include(a => a.AgreementRebates)
                .Where(a => a.Status == "Active"
                            && a.AgreementRebates.Any())
                .ToListAsync(ct);

            if (!activeAgreements.Any())
            {
                _logger.LogDebug("Không có Active agreement nào có rebate tiers");
                return;
            }

            _logger.LogInformation($"Tìm thấy {activeAgreements.Count} Active agreement(s) cần tính rebate");

            // 2. Xử lý từng agreement (try-catch từng agreement để không block các agreement khác)
            foreach (var agreement in activeAgreements)
            {
                try
                {
                    await ProcessAgreementRebate(db, agreement, ct);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Lỗi khi tính rebate cho Agreement {AgreementId} ({Code})",
                        agreement.AgreementId, agreement.Code);
                }
            }
        }

        private async Task ProcessAgreementRebate(
            EVDmsDbContext db,
            DealerAgreement agreement,
            CancellationToken ct)
        {
            var deliveredOrders = await db.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.AgreementId == agreement.AgreementId
                            && o.DeliveredAt.HasValue
                            && o.Status == "Delivered")
                .ToListAsync(ct);

            if (!deliveredOrders.Any())
            {
                _logger.LogDebug(
                    "Agreement {AgreementId} ({Code}) không có orders đã delivered",
                    agreement.AgreementId, agreement.Code);
                return;
            }

            _logger.LogInformation(
                "Agreement {AgreementId} ({Code}) có {Count} orders đã delivered",
                agreement.AgreementId, agreement.Code, deliveredOrders.Count);

            var ordersByPeriod = deliveredOrders
                .GroupBy(o => GetPeriodFromDate(o.DeliveredAt!.Value))
                .ToList();

            foreach (var periodGroup in ordersByPeriod)
            {
                var period = periodGroup.Key;

                // 5. Check duplicate - không tính lại nếu đã có Claim cho AgreementId + Period
                var existingClaim = await db.Claims
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.AgreementId == agreement.AgreementId
                                              && c.Period == period
                                              && c.AgreementId != null
                                              && c.Period != null, ct);

                if (existingClaim != null)
                {
                    _logger.LogDebug(
                        "Agreement {AgreementId}, Period {Period} đã có Claim {ClaimId}, bỏ qua",
                        agreement.AgreementId, period, existingClaim.ClaimId);
                    continue;
                }

                // 6. Tính tổng số units delivered trong period này
                var unitsDelivered = periodGroup
                    .SelectMany(o => o.OrderItems)
                    .Sum(oi => oi.Qty);

                // 7. Tìm tier phù hợp từ AgreementRebates
                var rebateTiers = agreement.AgreementRebates
                    .Where(r => r.Period == period)
                    .OrderByDescending(r => r.TierQty) // Tier cao nhất trước
                    .ToList();

                if (!rebateTiers.Any())
                {
                    _logger.LogWarning(
                        "Agreement {AgreementId}, Period {Period} không có rebate tiers",
                        agreement.AgreementId, period);
                    continue;
                }

                // Tìm tier phù hợp: tier cao nhất mà UnitsDelivered >= TierQty
                var applicableTier = rebateTiers
                    .FirstOrDefault(t => unitsDelivered >= t.TierQty);

                if (applicableTier == null)
                {
                    _logger.LogDebug(
                        "Agreement {AgreementId}, Period {Period}: UnitsDelivered {Units} chưa đạt tier thấp nhất {TierQty}",
                        agreement.AgreementId, period, unitsDelivered, rebateTiers.Min(t => t.TierQty));
                    continue;
                }

                // 8. Tính rebate = min(UnitsDelivered * RebatePerUnit, CapAmount)
                // Lưu ý: Chỉ áp dụng CapAmount nếu CapAmount > 0 (CapAmount = 0 hoặc NULL nghĩa là không có giới hạn)
                var rebateAmount = unitsDelivered * applicableTier.RebatePerUnit;
                if (applicableTier.CapAmount.HasValue
                    && applicableTier.CapAmount.Value > 0
                    && rebateAmount > applicableTier.CapAmount.Value)
                {
                    rebateAmount = applicableTier.CapAmount.Value;
                }

                // 9. Tạo Claim (rebate claim)
                var rebateClaim = new Claim
                {
                    DealerId = agreement.DealerId,
                    AgreementId = agreement.AgreementId,
                    Period = period,
                    Amount = rebateAmount,
                    Status = "Pending", // Rebate claim mới tạo
                    CreatedAt = DateTime.UtcNow
                };

                db.Claims.Add(rebateClaim);
                await db.SaveChangesAsync(ct);

                _logger.LogInformation(
                    "Đã tạo Rebate Claim {ClaimId} cho Agreement {AgreementId}, Period {Period}: " +
                    "UnitsDelivered={Units}, TierQty={TierQty}, RebateAmount={Amount:C}",
                    rebateClaim.ClaimId, agreement.AgreementId, period,
                    unitsDelivered, applicableTier.TierQty, rebateAmount);
            }
        }

        /// <summary>
        /// Chuyển đổi DateTime thành Period format (YYYY-MM)
        /// Ví dụ: 2024-03-15 → "2024-03"
        /// </summary>
        private static string GetPeriodFromDate(DateTime date)
        {
            return date.ToString("yyyy-MM");
        }
    }
}

