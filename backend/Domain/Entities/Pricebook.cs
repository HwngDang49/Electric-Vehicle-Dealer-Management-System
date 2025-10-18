using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Pricebook
{
    public long PricebookId { get; set; }

    public long? DealerId { get; set; }

    public string Name { get; set; } = null!;

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual Dealer? Dealer { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<PricebookItem> PricebookItems { get; set; } = new List<PricebookItem>();

    public virtual ICollection<Quote> Quotes { get; set; } = new List<Quote>();
}
