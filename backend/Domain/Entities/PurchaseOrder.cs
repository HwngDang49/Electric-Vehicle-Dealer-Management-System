using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class PurchaseOrder
{
    public long PoId { get; set; }

    public long DealerId { get; set; }

    public long? BranchId { get; set; }

    public string Status { get; set; } = null!;

    public DateOnly? ExpectedDate { get; set; }

    public long CreatedBy { get; set; }

    public long? SubmittedBy { get; set; }

    public long? ApprovedBy { get; set; }

    public long? ConfirmedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual User? ApprovedByNavigation { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual User? ConfirmedByNavigation { get; set; }

    public virtual User CreatedByNavigation { get; set; } = null!;

    public virtual Dealer Dealer { get; set; } = null!;

    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    public virtual ICollection<PoItem> PoItems { get; set; } = new List<PoItem>();

    public virtual User? SubmittedByNavigation { get; set; }
}
