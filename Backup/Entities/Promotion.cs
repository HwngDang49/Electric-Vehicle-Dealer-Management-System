using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Promotion
{
    public long PromotionId { get; set; }

    public string Code { get; set; } = null!;

    public long? DealerId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string FundedBy { get; set; } = null!;

    public string StackingRule { get; set; } = null!;

    public decimal? BudgetTotal { get; set; }

    public string RuleType { get; set; } = null!;

    public decimal? ValueNum { get; set; }

    public decimal? MaxAmount { get; set; }

    public decimal? MinPrice { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Claim> Claims { get; set; } = new List<Claim>();

    public virtual Dealer? Dealer { get; set; }

    public virtual ICollection<PromotionScope> PromotionScopes { get; set; } = new List<PromotionScope>();
}
