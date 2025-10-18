using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class SalesDocument
{
    public long SalesDocId { get; set; }

    public string DocType { get; set; } = null!;

    public long DealerId { get; set; }

    public long CustomerId { get; set; }

    public long? PricebookId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? LockedUntil { get; set; }

    public DateOnly? EtaDate { get; set; }

    public decimal DepositAmount { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime? DeliveredAt { get; set; }

    public string? ReceiverName { get; set; }

    public string? DeliveryDocUrl { get; set; }

    public string? ContractNo { get; set; }

    public DateTime? SignedAt { get; set; }

    public string? ContractFileUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public decimal? RequiredDepositAmount { get; set; }

    public virtual ICollection<Claim> Claims { get; set; } = new List<Claim>();

    public virtual Customer Customer { get; set; } = null!;

    public virtual Dealer Dealer { get; set; } = null!;

    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    public virtual Pricebook? Pricebook { get; set; }

    public virtual ICollection<SalesDocumentItem> SalesDocumentItems { get; set; } = new List<SalesDocumentItem>();
}
