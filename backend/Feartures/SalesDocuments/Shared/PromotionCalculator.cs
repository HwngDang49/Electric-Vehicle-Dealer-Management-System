using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Shared
{
    /// <summary>
    /// Lớp tĩnh chuyên tính toán khuyến mãi cho OrderItem và QuoteItem.
    /// TODO: Implement logic dựa trên bảng promotions và promotion_scopes mới
    /// </summary>
    public static class PromotionCalculator
    {
        /// <summary>
        /// Tính toán khuyến mãi cho OrderItem
        /// </summary>
        public static async Task<decimal> CalculateAsync(
            EVDmsDbContext db,
            long dealerId,
            OrderItem item,
            CancellationToken ct)
        {
            return await CalculatePromotionForItem(db, dealerId, item.ProductId, item.UnitPrice, item.Qty, ct);
        }

        /// <summary>
        /// Tính toán khuyến mãi cho QuoteItem
        /// </summary>
        public static async Task<decimal> CalculateAsync(
            EVDmsDbContext db,
            long dealerId,
            QuoteItem item,
            CancellationToken ct)
        {
            return await CalculatePromotionForItem(db, dealerId, item.ProductId, item.UnitPrice, item.Qty, ct);
        }

        /// <summary>
        /// Logic tính toán khuyến mãi chung cho cả OrderItem và QuoteItem
        /// Tính toán dựa trên các promotions active, áp dụng stacking rules
        /// </summary>
        private static async Task<decimal> CalculatePromotionForItem(
            EVDmsDbContext db,
            long dealerId,
            long productId,
            decimal unitPrice,
            int quantity,
            CancellationToken ct)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // 1. Tìm các promotions active hiện tại
            var applicablePromotions = await db.Promotions
                .Where(p => 
                    p.Status == PromotionStatus.Active &&
                    p.EffectiveFrom <= today &&
                    (p.EffectiveTo == null || p.EffectiveTo >= today) &&
                    (p.DealerId == null || p.DealerId == dealerId) // OEM (null) hoặc Dealer-specific
                )
                .Include(p => p.PromotionScopes)
                .ToListAsync(ct);

            // 2. Filter theo product_id qua promotion_scopes
            var validPromotions = applicablePromotions
                .Where(p => 
                    // Nếu không có scope nào => áp dụng cho tất cả sản phẩm
                    !p.PromotionScopes.Any() || 
                    // Hoặc có scope chứa productId này
                    p.PromotionScopes.Any(ps => ps.ProductId == null || ps.ProductId == productId)
                )
                .ToList();

            if (!validPromotions.Any())
            {
                return 0; // Không có promotion nào áp dụng
            }

            // 3. Apply stacking rules
            decimal totalDiscount = 0;

            // Kiểm tra xem có promotion Exclusive không
            var exclusivePromotions = validPromotions
                .Where(p => p.StackingRule == StackingRule.Exclusive)
                .ToList();

            if (exclusivePromotions.Any())
            {
                // Nếu có Exclusive promotion, chỉ lấy promotion có AmountOff cao nhất
                totalDiscount = exclusivePromotions.Max(p => p.AmountOff);
            }
            else
            {
                // Tất cả đều Stackable, cộng tất cả lại
                totalDiscount = validPromotions.Sum(p => p.AmountOff);
            }

            // 4. Tính tổng promotion amount cho line item
            // AmountOff có thể là giảm giá trên 1 đơn vị hoặc tổng line
            // Giả định: AmountOff là giảm giá cho mỗi sản phẩm
            decimal linePromoTotal = totalDiscount * quantity;

            // Đảm bảo không giảm quá tổng giá trị line
            decimal lineTotal = unitPrice * quantity;
            return Math.Min(linePromoTotal, lineTotal);
        }
    }
}
