using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Settlement
{
    public long SettlementId { get; set; }

    public long ClaimId { get; set; }

    public decimal PaidAmount { get; set; }

    public DateTime PaidAt { get; set; }

    public string? ReferenceNo { get; set; }

    public virtual Claim Claim { get; set; } = null!;
}
