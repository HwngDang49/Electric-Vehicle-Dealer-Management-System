using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class User
{
    public long UserId { get; set; }

    public long? DealerId { get; set; }

    public long? BranchId { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? Salting { get; set; }

    public string? FullName { get; set; }

    public string? Role { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreateAt { get; set; }

    public DateTime UpdateAt { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual Dealer? Dealer { get; set; }

    public virtual ICollection<PurchaseOrder> PurchaseOrderApprovedByNavigations { get; set; } = new List<PurchaseOrder>();

    public virtual ICollection<PurchaseOrder> PurchaseOrderConfirmedByNavigations { get; set; } = new List<PurchaseOrder>();

    public virtual ICollection<PurchaseOrder> PurchaseOrderCreateByNavigations { get; set; } = new List<PurchaseOrder>();

    public virtual ICollection<PurchaseOrder> PurchaseOrderSubmittedByNavigations { get; set; } = new List<PurchaseOrder>();

    public virtual ICollection<Quote> Quotes { get; set; } = new List<Quote>();
}
