using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Keyless]
public partial class VB2bInvoiceSummary
{
    [Column("invoice_id")]
    public long InvoiceId { get; set; }

    [Column("invoice_no")]
    [StringLength(50)]
    public string InvoiceNo { get; set; } = null!;

    [Column("dealer_id")]
    public long DealerId { get; set; }

    [Column("po_id")]
    public long? PoId { get; set; }

    [Column("invoice_amount", TypeName = "decimal(18, 2)")]
    public decimal InvoiceAmount { get; set; }

    [Column("paid_amount", TypeName = "decimal(38, 2)")]
    public decimal PaidAmount { get; set; }

    [Column("outstanding_amount", TypeName = "decimal(38, 2)")]
    public decimal? OutstandingAmount { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("issued_at")]
    public DateTime IssuedAt { get; set; }

    [Column("due_at")]
    public DateTime? DueAt { get; set; }
}
