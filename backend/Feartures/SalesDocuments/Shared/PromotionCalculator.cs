using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Shared
{
    /// <summary>
    /// Lớp tĩnh chuyên tính toán khuyến mãi, chỉ dùng nội bộ trong slice CreateOrder.
    /// </summary>
    public static class PromotionCalculator
    {
        public static async Task<decimal> CalculateAsync(
            EVDmsDbContext db,
            long dealerId,
            SalesDocumentItem item,
            CancellationToken ct)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Tối ưu hóa: Gộp 2 truy vấn thành 1 bằng JOIN
            var applicablePromos = await db.Promotions
                .AsNoTracking()
                .Where(p =>
                    (p.DealerId == dealerId || p.DealerId == null) &&
                    p.Status == PromotionStatus.Active.ToString() &&
                    p.EffectiveFrom <= today &&
                    (p.EffectiveTo == null || p.EffectiveTo >= today) &&
                    p.PromotionScopes.Any(s => s.ProductId == null || s.ProductId == item.ProductId)
                )
                .Select(p => new
                {
                    p.StackingRule,
                    p.RuleType,
                    p.ValueNum,
                    p.MaxAmount
                })
                .ToListAsync(ct);

            if (!applicablePromos.Any())
            {
                return 0m;
            }

            // Logic tính toán (giữ nguyên vì đã đúng)
            decimal lineSubtotal = item.UnitPrice * item.Qty;
            decimal bestExclusive = 0m;
            decimal sumStackable = 0m;

            foreach (var p in applicablePromos)
            {
                decimal discount = 0m;
                if (string.Equals(p.RuleType, "Percent", StringComparison.OrdinalIgnoreCase))
                {
                    var pct = (p.ValueNum ?? 0m) / 100m;
                    discount = Math.Round(lineSubtotal * pct, 0, MidpointRounding.AwayFromZero);
                }
                else if (string.Equals(p.RuleType, "Amount", StringComparison.OrdinalIgnoreCase))
                {
                    discount = p.ValueNum ?? 0m;
                }

                if (p.MaxAmount.HasValue && discount > p.MaxAmount.Value)
                    discount = p.MaxAmount.Value;

                if (discount <= 0) continue;

                // Phân loại khuyến mãi theo StackingRule
                // Exclusive: chỉ lấy cái tốt nhất
                if (string.Equals(p.StackingRule, "Exclusive", StringComparison.OrdinalIgnoreCase))
                {
                    if (discount > bestExclusive) bestExclusive = discount;
                }
                else
                {
                    sumStackable += discount;
                }
            }

            var totalPromo = Math.Max(bestExclusive, sumStackable);
            return totalPromo > lineSubtotal ? lineSubtotal : totalPromo;
        }
    }
}
