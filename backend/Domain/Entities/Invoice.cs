using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("invoices", Schema = "evdms")]
[Index("PoId", Name = "IX_invoices_po")]
[Index("SalesDocId", Name = "IX_invoices_salesdoc")]
[Index("InvoiceType", "Status", "DueAt", Name = "IX_invoices_type")]
[Index("InvoiceNo", Name = "UQ__invoices__F58CA1E2909AAE11", IsUnique = true)]
public partial class Invoice
{
    [Key]
    [Column("invoice_id")]
    public long InvoiceId { get; set; }

    [Column("invoice_type")]
    [StringLength(10)]
    public string InvoiceType { get; set; } = null!;

    [Column("dealer_id")]
    public long DealerId { get; set; }

    [Column("sales_doc_id")]
    public long? SalesDocId { get; set; }

    [Column("po_id")]
    public long? PoId { get; set; }

    [Column("invoice_no")]
    [StringLength(50)]
    public string InvoiceNo { get; set; } = null!;

    [Column("currency")]
    [StringLength(10)]
    public string Currency { get; set; } = null!;

    [Column("amount", TypeName = "decimal(18, 2)")]
    public decimal Amount { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("issued_at")]
    public DateTime IssuedAt { get; set; }

    [Column("due_at")]
    public DateTime? DueAt { get; set; }

    [Column("note")]
    public string? Note { get; set; }

    [ForeignKey("DealerId")]
    [InverseProperty("Invoices")]
    public virtual Dealer Dealer { get; set; } = null!;

    [InverseProperty("Invoice")]
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    [ForeignKey("PoId")]
    [InverseProperty("Invoices")]
    public virtual PurchaseOrder? Po { get; set; }

    [ForeignKey("SalesDocId")]
    [InverseProperty("Invoices")]
    public virtual SalesDocument? SalesDoc { get; set; }
}
