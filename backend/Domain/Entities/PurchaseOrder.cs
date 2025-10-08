using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("purchase_orders", Schema = "evdms")]
[Index("DealerId", "Status", Name = "IX_po_dealer_status")]
public partial class PurchaseOrder
{
    [Key]
    [Column("po_id")]
    public long PoId { get; set; }

    [Column("dealer_id")]
    public long DealerId { get; set; }

    [Column("branch_id")]
    public long? BranchId { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("expected_date")]
    public DateOnly? ExpectedDate { get; set; }

    [Column("created_by")]
    public long CreatedBy { get; set; }

    [Column("submitted_by")]
    public long? SubmittedBy { get; set; }

    [Column("approved_by")]
    public long? ApprovedBy { get; set; }

    [Column("confirmed_by")]
    public long? ConfirmedBy { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("ApprovedBy")]
    [InverseProperty("PurchaseOrderApprovedByNavigations")]
    public virtual User? ApprovedByNavigation { get; set; }

    [ForeignKey("BranchId")]
    [InverseProperty("PurchaseOrders")]
    public virtual Branch? Branch { get; set; }

    [ForeignKey("ConfirmedBy")]
    [InverseProperty("PurchaseOrderConfirmedByNavigations")]
    public virtual User? ConfirmedByNavigation { get; set; }

    [ForeignKey("CreatedBy")]
    [InverseProperty("PurchaseOrderCreatedByNavigations")]
    public virtual User CreatedByNavigation { get; set; } = null!;

    [ForeignKey("DealerId")]
    [InverseProperty("PurchaseOrders")]
    public virtual Dealer Dealer { get; set; } = null!;

    [InverseProperty("Po")]
    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    [InverseProperty("Po")]
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    [InverseProperty("Po")]
    public virtual ICollection<PoItem> PoItems { get; set; } = new List<PoItem>();

    [ForeignKey("SubmittedBy")]
    [InverseProperty("PurchaseOrderSubmittedByNavigations")]
    public virtual User? SubmittedByNavigation { get; set; }
}
