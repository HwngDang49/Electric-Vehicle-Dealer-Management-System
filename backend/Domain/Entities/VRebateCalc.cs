using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Keyless]
public partial class VRebateCalc
{
    [Column("agreement_id")]
    public long AgreementId { get; set; }

    [Column("dealer_id")]
    public long DealerId { get; set; }

    [Column("period")]
    [StringLength(20)]
    public string Period { get; set; } = null!;

    [Column("units_delivered")]
    public int? UnitsDelivered { get; set; }

    [Column("effective_tier_qty")]
    public int? EffectiveTierQty { get; set; }

    [Column("rebate_per_unit", TypeName = "decimal(18, 2)")]
    public decimal? RebatePerUnit { get; set; }

    [Column("cap_amount", TypeName = "decimal(18, 2)")]
    public decimal? CapAmount { get; set; }

    [Column("gross_rebate_amount", TypeName = "decimal(29, 2)")]
    public decimal? GrossRebateAmount { get; set; }

    [Column("payable_rebate_amount", TypeName = "decimal(29, 2)")]
    public decimal? PayableRebateAmount { get; set; }
}
