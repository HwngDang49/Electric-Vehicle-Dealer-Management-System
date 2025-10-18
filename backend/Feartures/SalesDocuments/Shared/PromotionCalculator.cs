using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Shared
{
    /// <summary>
    /// Lớp tĩnh chuyên tính toán khuyến mãi cho OrderItem và QuoteItem.
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
        /// Sử dụng promotion từ PricebookItem (OemDiscountAmount và OemDiscountPercent)
        /// </summary>
        private static async Task<decimal> CalculatePromotionForItem(
            EVDmsDbContext db,
            long dealerId,
            long productId,
            decimal unitPrice,
            int quantity,
            CancellationToken ct)
        {
            var totalAmount = unitPrice * quantity;
            decimal promotionAmount = 0;

            // Lấy promotion từ PricebookItem của product
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var pricebookItem = await db.PricebookItems
                .AsNoTracking()
                .Include(pbi => pbi.Pricebook)
                .Where(pbi => pbi.ProductId == productId && 
                             pbi.Pricebook.Status == "Active" &&
                             pbi.Pricebook.EffectiveFrom <= today &&
                             (pbi.Pricebook.EffectiveTo == null || pbi.Pricebook.EffectiveTo >= today))
                .FirstOrDefaultAsync(ct);

            if (pricebookItem != null)
            {
                // Tính promotion dựa trên OemDiscountAmount hoặc OemDiscountPercent
                if (pricebookItem.OemDiscountAmount.HasValue)
                {
                    // Ưu tiên sử dụng OemDiscountAmount (số tiền cố định)
                    promotionAmount = pricebookItem.OemDiscountAmount.Value * quantity;
                }
                else if (pricebookItem.OemDiscountPercent.HasValue)
                {
                    // Sử dụng OemDiscountPercent (phần trăm)
                    promotionAmount = totalAmount * (pricebookItem.OemDiscountPercent.Value / 100m);
                }
            }

            // Giới hạn promotion không được vượt quá tổng giá trị đơn hàng
            promotionAmount = Math.Min(promotionAmount, totalAmount);

            return Math.Round(promotionAmount, 0); // Làm tròn về số nguyên
        }
    }
}
