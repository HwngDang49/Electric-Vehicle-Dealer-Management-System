using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("branches", Schema = "evdms")]
[Index("DealerId", Name = "IX_branches_dealer")]
[Index("DealerId", "Code", Name = "UQ_branches_dealer_code", IsUnique = true)]
public partial class Branch
{
    [Key]
    [Column("branch_id")]
    public long BranchId { get; set; }

    [Column("dealer_id")]
    public long DealerId { get; set; }

    [Column("code")]
    [StringLength(50)]
    public string Code { get; set; } = null!;

    [Column("name")]
    [StringLength(255)]
    public string Name { get; set; } = null!;

    [Column("address")]
    public string? Address { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("DealerId")]
    [InverseProperty("Branches")]
    public virtual Dealer Dealer { get; set; } = null!;

    [InverseProperty("Branch")]
    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    [InverseProperty("Branch")]
    public virtual ICollection<PromotionScope> PromotionScopes { get; set; } = new List<PromotionScope>();

    [InverseProperty("Branch")]
    public virtual ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();

    [InverseProperty("Branch")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
