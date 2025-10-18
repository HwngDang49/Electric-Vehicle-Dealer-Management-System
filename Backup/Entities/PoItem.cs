using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class PoItem
{
    public long PoItemId { get; set; }

    public long PoId { get; set; }

    public long ProductId { get; set; }

    public int Qty { get; set; }

    public decimal UnitWholesale { get; set; }

    public decimal? LineTotal { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    public virtual PurchaseOrder Po { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}
