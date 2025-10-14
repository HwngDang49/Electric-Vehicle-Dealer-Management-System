using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class AuditLog
{
    public long AuditId { get; set; }

    public long? DealerId { get; set; }

    public long? UserId { get; set; }

    public string EntityName { get; set; } = null!;

    public string EntityId { get; set; } = null!;

    public string Action { get; set; } = null!;

    public string? ChangedData { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Dealer? Dealer { get; set; }

    public virtual User? User { get; set; }
}
