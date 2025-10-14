using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class VRebatePeriodSale
{
    public long AgreementId { get; set; }

    public long DealerId { get; set; }

    public string Period { get; set; } = null!;

    public long? OrderCount { get; set; }

    public int? UnitsDelivered { get; set; }

    public decimal? RetailRevenue { get; set; }
}
