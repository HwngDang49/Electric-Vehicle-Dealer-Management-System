using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class PricebookItem
{
    public long PricebookItemId { get; set; }

    public long PricebookId { get; set; }

    public long ProductId { get; set; }

    public decimal MsrpPrice { get; set; }

    public decimal? FloorPrice { get; set; }

    public decimal? OemDiscountAmount { get; set; }

    public decimal? OemDiscountPercent { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Pricebook Pricebook { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}
