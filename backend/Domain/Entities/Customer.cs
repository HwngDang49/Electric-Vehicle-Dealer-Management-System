using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Customer
{
    public long CustomerId { get; set; }

    public long DealerId { get; set; }

    public string FullName { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? IdNumber { get; set; }

    public string? Address { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual Dealer Dealer { get; set; } = null!;

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Quote> Quotes { get; set; } = new List<Quote>();

    public virtual ICollection<TestDrife> TestDrives { get; set; } = new List<TestDrife>();
}
