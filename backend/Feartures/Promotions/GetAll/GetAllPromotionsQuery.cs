using backend.Domain.Enums;

namespace backend.Feartures.Promotions.GetAll
{
    public class GetAllPromotionsQuery
    {
        public long PromotionId { get; set; }
        public long? DealerId { get; set; }
        public string? DealerName { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string FundedBy { get; set; } = string.Empty;
        public string StackingRule { get; set; } = string.Empty;
        public decimal AmountOff { get; set; }
        public DateOnly EffectiveFrom { get; set; }
        public DateOnly? EffectiveTo { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int ScopeCount { get; set; } // Số lượng scopes
    }
}

