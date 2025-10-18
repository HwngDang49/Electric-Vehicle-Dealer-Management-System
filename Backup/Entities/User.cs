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

    public string? FullName { get; set; }

    public string Role { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? Salting { get; set; }

    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    public virtual Branch? Branch { get; set; }

    public virtual ICollection<CustomerActivity> CustomerActivities { get; set; } = new List<CustomerActivity>();

    public virtual Dealer? Dealer { get; set; }

    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<PurchaseOrder> PurchaseOrderApprovedByNavigations { get; set; } = new List<PurchaseOrder>();

    public virtual ICollection<PurchaseOrder> PurchaseOrderConfirmedByNavigations { get; set; } = new List<PurchaseOrder>();

    public virtual ICollection<PurchaseOrder> PurchaseOrderCreatedByNavigations { get; set; } = new List<PurchaseOrder>();

    public virtual ICollection<PurchaseOrder> PurchaseOrderSubmittedByNavigations { get; set; } = new List<PurchaseOrder>();
}
