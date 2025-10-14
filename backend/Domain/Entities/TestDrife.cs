using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class TestDrife
{
    public long TestDriveId { get; set; }

    public long DealerId { get; set; }

    public long CustomerId { get; set; }

    public long? ProductId { get; set; }

    public DateTime ScheduledAt { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual Dealer Dealer { get; set; } = null!;

    public virtual Product? Product { get; set; }
}
