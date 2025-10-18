using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class VB2bInvoiceSummary
{
    public long InvoiceId { get; set; }

    public string InvoiceNo { get; set; } = null!;

    public long DealerId { get; set; }

    public long? PoId { get; set; }

    public decimal InvoiceAmount { get; set; }

    public decimal PaidAmount { get; set; }

    public decimal? OutstandingAmount { get; set; }

    public string Status { get; set; } = null!;

    public DateTime IssuedAt { get; set; }

    public DateTime? DueAt { get; set; }
}
