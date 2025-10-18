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

    public DateTime CreatedAt { get; set; }

    public string? Status { get; set; }

    public virtual ICollection<CustomerActivity> CustomerActivities { get; set; } = new List<CustomerActivity>();

    public virtual Dealer Dealer { get; set; } = null!;

    public virtual ICollection<SalesDocument> SalesDocuments { get; set; } = new List<SalesDocument>();

    public virtual ICollection<TestDrife> TestDrives { get; set; } = new List<TestDrife>();
}
