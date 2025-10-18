using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Claim
{
    public long ClaimId { get; set; }

    public long DealerId { get; set; }

    public long? OrderId { get; set; }

    public long? PromotionId { get; set; }

    public decimal Amount { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? ResolvedAt { get; set; }

    public virtual Dealer Dealer { get; set; } = null!;

    public virtual Order? Order { get; set; }

    public virtual ICollection<Settlement> Settlements { get; set; } = new List<Settlement>();
}
