using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Payment
{
    public long PaymentId { get; set; }

    public long InvoiceId { get; set; }

    public decimal Amount { get; set; }

    public string Status { get; set; } = null!;

    public string? Method { get; set; }

    public DateTime? PaidAt { get; set; }

    public string? ReferenceNo { get; set; }

    public string? Note { get; set; }

    public long? CreatedBy { get; set; }

    public virtual Invoice Invoice { get; set; } = null!;
}
