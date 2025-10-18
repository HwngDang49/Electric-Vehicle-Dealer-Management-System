using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class PromotionScope
{
    public long PromotionScopeId { get; set; }

    public long PromotionId { get; set; }

    public long? ProductId { get; set; }

    public long? BranchId { get; set; }

    public string? RegionCode { get; set; }

    public virtual Branch? Branch { get; set; }

    public virtual Product? Product { get; set; }

    public virtual Promotion Promotion { get; set; } = null!;
}
