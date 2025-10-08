using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("payments", Schema = "evdms")]
[Index("InvoiceId", Name = "IX_payments_invoice")]
public partial class Payment
{
    [Key]
    [Column("payment_id")]
    public long PaymentId { get; set; }

    [Column("invoice_id")]
    public long InvoiceId { get; set; }

    [Column("amount", TypeName = "decimal(18, 2)")]
    public decimal Amount { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("method")]
    [StringLength(50)]
    public string? Method { get; set; }

    [Column("paid_at")]
    public DateTime? PaidAt { get; set; }

    [Column("reference_no")]
    [StringLength(100)]
    public string? ReferenceNo { get; set; }

    [Column("note")]
    public string? Note { get; set; }

    [Column("created_by")]
    public long? CreatedBy { get; set; }

    [ForeignKey("CreatedBy")]
    [InverseProperty("Payments")]
    public virtual User? CreatedByNavigation { get; set; }

    [ForeignKey("InvoiceId")]
    [InverseProperty("Payments")]
    public virtual Invoice Invoice { get; set; } = null!;
}
