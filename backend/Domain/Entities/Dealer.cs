using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Dealer
{
    public long DealerId { get; set; }

    public string Code { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? LegalName { get; set; }

    public string? TaxId { get; set; }

    public string Status { get; set; } = null!;

    public decimal CreditLimit { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Branch> Branches { get; set; } = new List<Branch>();

    public virtual ICollection<Claim> Claims { get; set; } = new List<Claim>();

    public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();

    public virtual ICollection<DealerAgreement> DealerAgreements { get; set; } = new List<DealerAgreement>();

    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Pricebook> Pricebooks { get; set; } = new List<Pricebook>();

    public virtual ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();

    public virtual ICollection<Quote> Quotes { get; set; } = new List<Quote>();

    public virtual ICollection<TestDrife> TestDrives { get; set; } = new List<TestDrife>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
