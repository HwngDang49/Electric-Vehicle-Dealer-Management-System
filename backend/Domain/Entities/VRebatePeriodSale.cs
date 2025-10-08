using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Keyless]
public partial class VRebatePeriodSale
{
    [Column("agreement_id")]
    public long AgreementId { get; set; }

    [Column("dealer_id")]
    public long DealerId { get; set; }

    [Column("period")]
    [StringLength(20)]
    public string Period { get; set; } = null!;

    [Column("order_count")]
    public long? OrderCount { get; set; }

    [Column("units_delivered")]
    public int? UnitsDelivered { get; set; }

    [Column("retail_revenue", TypeName = "decimal(38, 2)")]
    public decimal? RetailRevenue { get; set; }
}
