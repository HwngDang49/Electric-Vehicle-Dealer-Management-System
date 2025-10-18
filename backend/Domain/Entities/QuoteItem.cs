using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class QuoteItem
{
    public long QuoteItemId { get; set; }

    public long QuoteId { get; set; }

    public long ProductId { get; set; }

    public decimal UnitPrice { get; set; }

    public int Qty { get; set; }

    public decimal? OemDiscountApplied { get; set; }

    public decimal? LinePromo { get; set; }

    public decimal? LineTotal { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual Quote Quote { get; set; } = null!;
}
