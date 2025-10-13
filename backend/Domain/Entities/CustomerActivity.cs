using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("customer_activities", Schema = "evdms")]
[Index("CustomerId", "CreatedAt", Name = "IX_ca_customer", IsDescending = new[] { false, true })]
public partial class CustomerActivity
{
    [Key]
    [Column("activity_id")]
    public long ActivityId { get; set; }

    [Column("customer_id")]
    public long CustomerId { get; set; }

    [Column("channel")]
    [StringLength(10)]
    public string Channel { get; set; } = null!;

    [Column("direction")]
    [StringLength(10)]
    public string Direction { get; set; } = null!;

    [Column("type")]
    [StringLength(30)]
    public string? Type { get; set; }

    [Column("related_entity")]
    [StringLength(40)]
    public string? RelatedEntity { get; set; }

    [Column("related_id")]
    [StringLength(100)]
    public string? RelatedId { get; set; }

    [Column("subject")]
    [StringLength(255)]
    public string? Subject { get; set; }

    [Column("status")]
    [StringLength(20)]
    public string Status { get; set; } = null!;

    [Column("provider_msg_id")]
    [StringLength(100)]
    public string? ProviderMsgId { get; set; }

    [Column("created_by")]
    public long? CreatedBy { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("CreatedBy")]
    [InverseProperty("CustomerActivities")]
    public virtual User? CreatedByNavigation { get; set; }

    [ForeignKey("CustomerId")]
    [InverseProperty("CustomerActivities")]
    public virtual Customer Customer { get; set; } = null!;
}
