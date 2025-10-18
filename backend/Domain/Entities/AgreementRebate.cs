using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class AgreementRebate
{
    public long RebateId { get; set; }

    public long AgreementId { get; set; }

    public string Period { get; set; } = null!;

    public int TierQty { get; set; }

    public decimal RebatePerUnit { get; set; }

    public decimal? CapAmount { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual DealerAgreement Agreement { get; set; } = null!;
}
