using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Product
{
    public long ProductId { get; set; }

    public string ProductCode { get; set; } = null!;

    public string? ModelCode { get; set; }

    public string? VariantCode { get; set; }

    public string? ColorCode { get; set; }

    public string Name { get; set; } = null!;

    public string? ModelName { get; set; }

    public string? ColorName { get; set; }

    public decimal? BatteryKwh { get; set; }

    public decimal? MotorKw { get; set; }

    public int? RangeKm { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    public virtual ICollection<PoItem> PoItems { get; set; } = new List<PoItem>();

    public virtual ICollection<Pricebook> Pricebooks { get; set; } = new List<Pricebook>();

    public virtual ICollection<PromotionScope> PromotionScopes { get; set; } = new List<PromotionScope>();

    public virtual ICollection<SalesDocumentItem> SalesDocumentItems { get; set; } = new List<SalesDocumentItem>();

    public virtual ICollection<TestDrife> TestDrives { get; set; } = new List<TestDrife>();
}
