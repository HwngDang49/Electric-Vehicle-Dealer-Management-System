using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Inventory
{
    public string Vin { get; set; } = null!;

    public string OwnerType { get; set; } = null!;

    public long? OwnerId { get; set; }

    public string? LocationType { get; set; }

    public long? LocationId { get; set; }

    public long? DealerId { get; set; }

    public long? BranchId { get; set; }

    public long ProductId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? ReceivedAt { get; set; }

    public long? OrderId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual Dealer? Dealer { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Product Product { get; set; } = null!;
}
