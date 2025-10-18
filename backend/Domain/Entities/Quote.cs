using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Quote
{
    public long QuoteId { get; set; }

    public long DealerId { get; set; }

    public long CustomerId { get; set; }

    public long? PricebookId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? LockedUntil { get; set; }

    public decimal SubtotalAmount { get; set; }

    public decimal PromotionAmount { get; set; }

    public decimal TotalAmount { get; set; }

    public long? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual Dealer Dealer { get; set; } = null!;

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual Pricebook? Pricebook { get; set; }

    public virtual ICollection<QuoteItem> QuoteItems { get; set; } = new List<QuoteItem>();
}
