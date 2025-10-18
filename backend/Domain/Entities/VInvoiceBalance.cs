using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class VInvoiceBalance
{
    public long InvoiceId { get; set; }

    public string InvoiceType { get; set; } = null!;

    public long DealerId { get; set; }

    public string InvoiceNo { get; set; } = null!;

    public decimal Amount { get; set; }

    public decimal PaidAmount { get; set; }

    public decimal? OutstandingAmount { get; set; }

    public string Status { get; set; } = null!;

    public DateTime IssuedAt { get; set; }

    public DateTime? DueAt { get; set; }
}
