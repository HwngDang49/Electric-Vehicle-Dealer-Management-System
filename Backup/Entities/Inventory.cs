using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Inventory
{
    public string Vin { get; set; } = null!;

    public long? PoId { get; set; }

    public long? PoItemId { get; set; }

    public string OwnerType { get; set; } = null!;

    public long? OwnerId { get; set; }

    public string? LocationType { get; set; }

    public long? LocationId { get; set; }

    public long? DealerId { get; set; }

    public long? BranchId { get; set; }

    public long ProductId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? ReceivedAt { get; set; }

    public string? PdiResult { get; set; }

    public DateTime? PdiCheckedAt { get; set; }

    public long? PdiCheckedBy { get; set; }

    public long? AllocatedSdiId { get; set; }

    public DateTime? AllocatedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual SalesDocumentItem? AllocatedSdi { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual Dealer? Dealer { get; set; }

    public virtual User? PdiCheckedByNavigation { get; set; }

    public virtual PurchaseOrder? Po { get; set; }

    public virtual PoItem? PoItem { get; set; }

    public virtual Product Product { get; set; } = null!;
}
