using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class OrderItem
{
    public long OrderItemId { get; set; }

    public long OrderId { get; set; }

    public long ProductId { get; set; }

    public decimal UnitPrice { get; set; }

    public int Qty { get; set; }

    public decimal? OemDiscountApplied { get; set; }

    public decimal? LinePromo { get; set; }

    public decimal? LineTotal { get; set; }

    public virtual Order Order { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}
