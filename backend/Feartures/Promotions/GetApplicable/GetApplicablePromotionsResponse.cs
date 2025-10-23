namespace backend.Feartures.Promotions.GetApplicable
{
    public class GetApplicablePromotionsResponse
    {
        public long ProductId { get; set; }
        public decimal TotalDiscount { get; set; }
        public List<ApplicablePromotionDetail> Promotions { get; set; } = new();
    }

    public class ApplicablePromotionDetail
    {
        public long PromotionId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string FundedBy { get; set; } = string.Empty;
        public decimal AmountOff { get; set; }
        public string StackingRule { get; set; } = string.Empty;
        public DateOnly EffectiveFrom { get; set; }
        public DateOnly? EffectiveTo { get; set; }
    }
}

