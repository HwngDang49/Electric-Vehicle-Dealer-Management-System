using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class Product
{
    public long ProductId { get; set; }

    public string? ModelCode { get; set; }

    public string? VariantCode { get; set; }

    public string? ColorCode { get; set; }

    public string Name { get; set; } = null!;

    public decimal? BatteryKwh { get; set; }

    public decimal? MotorKw { get; set; }

    public int? RangeKm { get; set; }

    public string? ColorName { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<PoItem> PoItems { get; set; } = new List<PoItem>();

    public virtual ICollection<PricebookItem> PricebookItems { get; set; } = new List<PricebookItem>();

    public virtual ICollection<QuoteItem> QuoteItems { get; set; } = new List<QuoteItem>();

    public virtual ICollection<TestDrife> TestDrives { get; set; } = new List<TestDrife>();
}
