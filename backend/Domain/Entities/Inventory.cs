using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("inventory", Schema = "evdms")]
[Index("LocationType", "LocationId", Name = "IX_inv_location")]
[Index("OwnerType", "OwnerId", Name = "IX_inv_owner")]
[Index("PoId", Name = "IX_inv_po")]
[Index("DealerId", Name = "IX_inventory_dealer")]
[Index("ProductId", Name = "IX_inventory_product")]
[Index("Status", Name = "IX_inventory_status")]
public partial class Inventory
{
    [Key]
    [Column("vin")]
    [StringLength(30)]
    public string Vin { get; set; } = null!;

    [Column("po_id")]
    public long? PoId { get; set; }

    [Column("po_item_id")]
    public long? PoItemId { get; set; }

    [Column("owner_type")]
    [StringLength(20)]
    public string OwnerType { get; set; } = null!;

    [Column("owner_id")]
    public long? OwnerId { get; set; }

    [Column("location_type")]
    [StringLength(20)]
    public string? LocationType { get; set; }

    [Column("location_id")]
    public long? LocationId { get; set; }

    [Column("dealer_id")]
    public long? DealerId { get; set; }

    [Column("branch_id")]
    public long? BranchId { get; set; }

    [Column("product_id")]
    public long ProductId { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("received_at")]
    public DateTime? ReceivedAt { get; set; }

    [Column("pdi_result")]
    [StringLength(20)]
    public string? PdiResult { get; set; }

    [Column("pdi_checked_at")]
    public DateTime? PdiCheckedAt { get; set; }

    [Column("pdi_checked_by")]
    public long? PdiCheckedBy { get; set; }

    [Column("allocated_sdi_id")]
    public long? AllocatedSdiId { get; set; }

    [Column("allocated_at")]
    public DateTime? AllocatedAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("AllocatedSdiId")]
    [InverseProperty("Inventories")]
    public virtual SalesDocumentItem? AllocatedSdi { get; set; }

    [ForeignKey("BranchId")]
    [InverseProperty("Inventories")]
    public virtual Branch? Branch { get; set; }

    [ForeignKey("DealerId")]
    [InverseProperty("Inventories")]
    public virtual Dealer? Dealer { get; set; }

    [ForeignKey("PdiCheckedBy")]
    [InverseProperty("Inventories")]
    public virtual User? PdiCheckedByNavigation { get; set; }

    [ForeignKey("PoId")]
    [InverseProperty("Inventories")]
    public virtual PurchaseOrder? Po { get; set; }

    [ForeignKey("PoItemId")]
    [InverseProperty("Inventories")]
    public virtual PoItem? PoItem { get; set; }

    [ForeignKey("ProductId")]
    [InverseProperty("Inventories")]
    public virtual Product Product { get; set; } = null!;
}
