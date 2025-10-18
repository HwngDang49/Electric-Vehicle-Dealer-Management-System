using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Invoice
{
    public long InvoiceId { get; set; }

    public string InvoiceType { get; set; } = null!;

    public long DealerId { get; set; }

    public long? SalesDocId { get; set; }

    public long? PoId { get; set; }

    public string InvoiceNo { get; set; } = null!;

    public string Currency { get; set; } = null!;

    public decimal Amount { get; set; }

    public string Status { get; set; } = null!;

    public DateTime IssuedAt { get; set; }

    public DateTime? DueAt { get; set; }

    public string? Note { get; set; }

    public virtual Dealer Dealer { get; set; } = null!;

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual PurchaseOrder? Po { get; set; }

    public virtual SalesDocument? SalesDoc { get; set; }
}
