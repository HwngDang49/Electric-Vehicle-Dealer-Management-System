using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("po_items", Schema = "evdms")]
[Index("PoId", Name = "IX_poi_po")]
[Index("PoId", "ProductId", Name = "UQ_poi", IsUnique = true)]
public partial class PoItem
{
    [Key]
    [Column("po_item_id")]
    public long PoItemId { get; set; }

    [Column("po_id")]
    public long PoId { get; set; }

    [Column("product_id")]
    public long ProductId { get; set; }

    [Column("qty")]
    public int Qty { get; set; }

    [Column("unit_wholesale", TypeName = "decimal(18, 2)")]
    public decimal UnitWholesale { get; set; }

    [Column("line_total", TypeName = "decimal(29, 2)")]
    public decimal? LineTotal { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("PoItem")]
    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    [ForeignKey("PoId")]
    [InverseProperty("PoItems")]
    public virtual PurchaseOrder Po { get; set; } = null!;

    [ForeignKey("ProductId")]
    [InverseProperty("PoItems")]
    public virtual Product Product { get; set; } = null!;
}
