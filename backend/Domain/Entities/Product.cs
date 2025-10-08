using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("products", Schema = "evdms")]
[Index("ModelCode", "VariantCode", Name = "IX_products_model")]
[Index("ProductCode", Name = "UQ__products__AE1A8CC49DEED32D", IsUnique = true)]
public partial class Product
{
    [Key]
    [Column("product_id")]
    public long ProductId { get; set; }

    [Column("product_code")]
    [StringLength(50)]
    public string ProductCode { get; set; } = null!;

    [Column("model_code")]
    [StringLength(50)]
    public string? ModelCode { get; set; }

    [Column("variant_code")]
    [StringLength(50)]
    public string? VariantCode { get; set; }

    [Column("color_code")]
    [StringLength(50)]
    public string? ColorCode { get; set; }

    [Column("name")]
    [StringLength(255)]
    public string Name { get; set; } = null!;

    [Column("model_name")]
    [StringLength(255)]
    public string? ModelName { get; set; }

    [Column("color_name")]
    [StringLength(100)]
    public string? ColorName { get; set; }

    [Column("battery_kwh", TypeName = "decimal(10, 2)")]
    public decimal? BatteryKwh { get; set; }

    [Column("motor_kw", TypeName = "decimal(10, 2)")]
    public decimal? MotorKw { get; set; }

    [Column("range_km")]
    public int? RangeKm { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Product")]
    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    [InverseProperty("Product")]
    public virtual ICollection<PoItem> PoItems { get; set; } = new List<PoItem>();

    [InverseProperty("Product")]
    public virtual ICollection<Pricebook> Pricebooks { get; set; } = new List<Pricebook>();

    [InverseProperty("Product")]
    public virtual ICollection<PromotionScope> PromotionScopes { get; set; } = new List<PromotionScope>();

    [InverseProperty("Product")]
    public virtual ICollection<SalesDocumentItem> SalesDocumentItems { get; set; } = new List<SalesDocumentItem>();

    [InverseProperty("Product")]
    public virtual ICollection<TestDrife> TestDrives { get; set; } = new List<TestDrife>();
}
