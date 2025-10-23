using backend.Domain.Enums;

namespace backend.Feartures.Promotions.Get
{
    public class GetPromotionQuery
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
        public string? CreatedBy { get; set; }
        
        public List<PromotionScopeDetail> Scopes { get; set; } = new();
    }

    public class PromotionScopeDetail
    {
        public long PromotionScopeId { get; set; }
        public long? ProductId { get; set; }
        public string? ProductName { get; set; }
        public long? BranchId { get; set; }
        public string? BranchName { get; set; }
    }
}

