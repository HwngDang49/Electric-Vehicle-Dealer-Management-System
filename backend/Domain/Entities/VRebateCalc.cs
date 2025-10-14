using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class VRebateCalc
{
    public long AgreementId { get; set; }

    public long DealerId { get; set; }

    public string Period { get; set; } = null!;

    public int? UnitsDelivered { get; set; }

    public int? EffectiveTierQty { get; set; }

    public decimal? RebatePerUnit { get; set; }

    public decimal? CapAmount { get; set; }

    public decimal? GrossRebateAmount { get; set; }

    public decimal? PayableRebateAmount { get; set; }
}
