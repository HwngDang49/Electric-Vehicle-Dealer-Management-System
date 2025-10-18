using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Pricebook
{
    public long PricebookId { get; set; }

    public long? DealerId { get; set; }

    public long ProductId { get; set; }

    public string Name { get; set; } = null!;

    public decimal MsrpPrice { get; set; }

    public decimal? FloorPrice { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual Dealer? Dealer { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual ICollection<SalesDocument> SalesDocuments { get; set; } = new List<SalesDocument>();
}
