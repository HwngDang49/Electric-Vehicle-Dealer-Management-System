using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("agreement_rebates", Schema = "evdms")]
[Index("AgreementId", "Period", Name = "IX_ar_agreement_period")]
[Index("AgreementId", "Period", "TierQty", Name = "IX_ar_tiers", IsDescending = new[] { false, false, true })]
public partial class AgreementRebate
{
    [Key]
    [Column("rebate_id")]
    public long RebateId { get; set; }

    [Column("agreement_id")]
    public long AgreementId { get; set; }

    [Column("period")]
    [StringLength(20)]
    public string Period { get; set; } = null!;

    [Column("tier_qty")]
    public int TierQty { get; set; }

    [Column("method")]
    [StringLength(20)]
    public string Method { get; set; } = null!;

    [Column("rebate_per_unit", TypeName = "decimal(18, 2)")]
    public decimal RebatePerUnit { get; set; }

    [Column("cap_amount", TypeName = "decimal(18, 2)")]
    public decimal? CapAmount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("AgreementId")]
    [InverseProperty("AgreementRebates")]
    public virtual DealerAgreement Agreement { get; set; } = null!;
}
