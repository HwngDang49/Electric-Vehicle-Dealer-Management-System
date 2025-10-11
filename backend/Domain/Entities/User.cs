using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("users", Schema = "evdms")]
[Index("BranchId", Name = "IX_users_branch")]
[Index("DealerId", Name = "IX_users_dealer")]
[Index("Role", Name = "IX_users_role")]
[Index("Email", Name = "UQ__users__AB6E6164F81F0211", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("user_id")]
    public long UserId { get; set; }

    [Column("dealer_id")]
    public long? DealerId { get; set; }

    [Column("branch_id")]
    public long? BranchId { get; set; }

    [Column("email")]
    [StringLength(255)]
    public string Email { get; set; } = null!;

    [Column("password_hash")]
    public string PasswordHash { get; set; } = null!;

    [Column("full_name")]
    [StringLength(255)]
    public string? FullName { get; set; }

    [Column("role")]
    [StringLength(30)]
    public string Role { get; set; } = null!;

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    [ForeignKey("BranchId")]
    [InverseProperty("Users")]
    public virtual Branch? Branch { get; set; }

    [InverseProperty("CreatedByNavigation")]
    public virtual ICollection<CustomerActivity> CustomerActivities { get; set; } = new List<CustomerActivity>();

    [ForeignKey("DealerId")]
    [InverseProperty("Users")]
    public virtual Dealer? Dealer { get; set; }

    [InverseProperty("PdiCheckedByNavigation")]
    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    [InverseProperty("CreatedByNavigation")]
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    [InverseProperty("ApprovedByNavigation")]
    public virtual ICollection<PurchaseOrder> PurchaseOrderApprovedByNavigations { get; set; } = new List<PurchaseOrder>();

    [InverseProperty("ConfirmedByNavigation")]
    public virtual ICollection<PurchaseOrder> PurchaseOrderConfirmedByNavigations { get; set; } = new List<PurchaseOrder>();

    [InverseProperty("CreatedByNavigation")]
    public virtual ICollection<PurchaseOrder> PurchaseOrderCreatedByNavigations { get; set; } = new List<PurchaseOrder>();

    [InverseProperty("SubmittedByNavigation")]
    public virtual ICollection<PurchaseOrder> PurchaseOrderSubmittedByNavigations { get; set; } = new List<PurchaseOrder>();
}
