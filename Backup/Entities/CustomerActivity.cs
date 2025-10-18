using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class CustomerActivity
{
    public long ActivityId { get; set; }

    public long CustomerId { get; set; }

    public string Channel { get; set; } = null!;

    public string Direction { get; set; } = null!;

    public string? Type { get; set; }

    public string? RelatedEntity { get; set; }

    public string? RelatedId { get; set; }

    public string? Subject { get; set; }

    public string Status { get; set; } = null!;

    public string? ProviderMsgId { get; set; }

    public long? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Customer Customer { get; set; } = null!;
}
