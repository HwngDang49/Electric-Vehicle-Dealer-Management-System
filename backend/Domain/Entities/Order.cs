using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Order
{
    public long OrderId { get; set; }

    public long DealerId { get; set; }

    public long? QuoteId { get; set; }

    public long CustomerId { get; set; }

    public long? PricebookId { get; set; }

    public string Status { get; set; } = null!;

    public DateOnly? EtaDate { get; set; }

    public decimal DepositAmount { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime? DeliveredAt { get; set; }

    public string? ReceiverName { get; set; }

    public string? DeliveryDocUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Claim> Claims { get; set; } = new List<Claim>();

    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();

    public virtual Customer Customer { get; set; } = null!;

    public virtual Dealer Dealer { get; set; } = null!;

    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual Pricebook? Pricebook { get; set; }

    public virtual Quote? Quote { get; set; }
}
