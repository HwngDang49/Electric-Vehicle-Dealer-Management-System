using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("promotion_scopes", Schema = "evdms")]
[Index("PromotionId", "ProductId", "BranchId", "RegionCode", Name = "UQ_promo_scopes", IsUnique = true)]
public partial class PromotionScope
{
    [Key]
    [Column("promotion_scope_id")]
    public long PromotionScopeId { get; set; }

    [Column("promotion_id")]
    public long PromotionId { get; set; }

    [Column("product_id")]
    public long? ProductId { get; set; }

    [Column("branch_id")]
    public long? BranchId { get; set; }

    [Column("region_code")]
    [StringLength(50)]
    public string? RegionCode { get; set; }

    [ForeignKey("BranchId")]
    [InverseProperty("PromotionScopes")]
    public virtual Branch? Branch { get; set; }

    [ForeignKey("ProductId")]
    [InverseProperty("PromotionScopes")]
    public virtual Product? Product { get; set; }

    [ForeignKey("PromotionId")]
    [InverseProperty("PromotionScopes")]
    public virtual Promotion Promotion { get; set; } = null!;
}
