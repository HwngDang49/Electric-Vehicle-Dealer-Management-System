using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("audit_logs", Schema = "evdms")]
[Index("DealerId", Name = "IX_audit_dealer")]
[Index("EntityName", "EntityId", Name = "IX_audit_entity")]
public partial class AuditLog
{
    [Key]
    [Column("audit_id")]
    public long AuditId { get; set; }

    [Column("dealer_id")]
    public long? DealerId { get; set; }

    [Column("user_id")]
    public long? UserId { get; set; }

    [Column("entity_name")]
    [StringLength(100)]
    public string EntityName { get; set; } = null!;

    [Column("entity_id")]
    [StringLength(100)]
    public string EntityId { get; set; } = null!;

    [Column("action")]
    [StringLength(50)]
    public string Action { get; set; } = null!;

    [Column("changed_data")]
    public string? ChangedData { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("DealerId")]
    [InverseProperty("AuditLogs")]
    public virtual Dealer? Dealer { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("AuditLogs")]
    public virtual User? User { get; set; }
}
