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
        /// TODO: Implement promotion logic dựa trên bảng promotions mới
        /// Hiện tại tạm thời return 0 (không có promotion)
        /// </summary>
        private static async Task<decimal> CalculatePromotionForItem(
            EVDmsDbContext db,
            long dealerId,
            long productId,
            decimal unitPrice,
            int quantity,
            CancellationToken ct)
        {
            // TODO: Implement logic lấy promotions từ bảng promotions và promotion_scopes
            // Ví dụ:
            // 1. Tìm các promotions active hiện tại
            // 2. Filter theo dealer_id và product_id (qua promotion_scopes)
            // 3. Apply stacking rules
            // 4. Tính tổng promotion amount
            
            await Task.CompletedTask; // Để giữ async signature
            return 0; // Tạm thời không có promotion
        }
    }
}
