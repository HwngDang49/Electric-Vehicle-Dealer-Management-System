using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("promotions", Schema = "evdms")]
[Index("EffectiveFrom", "EffectiveTo", Name = "IX_promotions_dates")]
[Index("DealerId", Name = "IX_promotions_dealer")]
[Index("Code", Name = "UQ__promotio__357D4CF95C454DD6", IsUnique = true)]
public partial class Promotion
{
    [Key]
    [Column("promotion_id")]
    public long PromotionId { get; set; }

    [Column("code")]
    [StringLength(50)]
    public string Code { get; set; } = null!;

    [Column("dealer_id")]
    public long? DealerId { get; set; }

    [Column("name")]
    [StringLength(255)]
    public string Name { get; set; } = null!;

    [Column("description")]
    public string? Description { get; set; }

    [Column("funded_by")]
    [StringLength(50)]
    public string FundedBy { get; set; } = null!;

    [Column("stacking_rule")]
    [StringLength(50)]
    public string StackingRule { get; set; } = null!;

    [Column("budget_total", TypeName = "decimal(18, 2)")]
    public decimal? BudgetTotal { get; set; }

    [Column("rule_type")]
    [StringLength(50)]
    public string RuleType { get; set; } = null!;

    [Column("value_num", TypeName = "decimal(18, 2)")]
    public decimal? ValueNum { get; set; }

    [Column("max_amount", TypeName = "decimal(18, 2)")]
    public decimal? MaxAmount { get; set; }

    [Column("min_price", TypeName = "decimal(18, 2)")]
    public decimal? MinPrice { get; set; }

    [Column("effective_from")]
    public DateOnly EffectiveFrom { get; set; }

    [Column("effective_to")]
    public DateOnly? EffectiveTo { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Promotion")]
    public virtual ICollection<Claim> Claims { get; set; } = new List<Claim>();

    [ForeignKey("DealerId")]
    [InverseProperty("Promotions")]
    public virtual Dealer? Dealer { get; set; }

    [InverseProperty("Promotion")]
    public virtual ICollection<PromotionScope> PromotionScopes { get; set; } = new List<PromotionScope>();
}
