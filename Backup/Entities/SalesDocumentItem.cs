using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class SalesDocumentItem
{
    public long SdiId { get; set; }

    public long SalesDocId { get; set; }

    public long ProductId { get; set; }

    public decimal UnitPrice { get; set; }

    public int Qty { get; set; }

    public decimal LineDiscount { get; set; }

    public decimal LinePromo { get; set; }

    public decimal? LineTotal { get; set; }

    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    public virtual Product Product { get; set; } = null!;

    public virtual SalesDocument SalesDoc { get; set; } = null!;
}
