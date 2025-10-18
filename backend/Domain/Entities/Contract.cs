using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Contract
{
    public long ContractId { get; set; }

    public long OrderId { get; set; }

    public string ContractNo { get; set; } = null!;

    public DateTime? SignedAt { get; set; }

    public string? FileUrl { get; set; }

    public virtual Order Order { get; set; } = null!;
}
