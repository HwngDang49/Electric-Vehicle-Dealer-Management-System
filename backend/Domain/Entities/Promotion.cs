using System;
using System.Collections.Generic;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

public partial class Promotion
{
    public long PromotionId { get; set; }

    public long? DealerId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public FundedBy FundedBy { get; set; }

    public StackingRule StackingRule { get; set; }

    public decimal AmountOff { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public PromotionStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public virtual Dealer? Dealer { get; set; }

    public virtual ICollection<PromotionScope> PromotionScopes { get; set; } = new List<PromotionScope>();
}
