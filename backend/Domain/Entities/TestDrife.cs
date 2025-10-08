using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("test_drives", Schema = "evdms")]
[Index("CustomerId", Name = "IX_td_customer")]
[Index("DealerId", Name = "IX_td_dealer")]
public partial class TestDrife
{
    [Key]
    [Column("test_drive_id")]
    public long TestDriveId { get; set; }

    [Column("dealer_id")]
    public long DealerId { get; set; }

    [Column("customer_id")]
    public long CustomerId { get; set; }

    [Column("product_id")]
    public long? ProductId { get; set; }

    [Column("scheduled_at")]
    public DateTime ScheduledAt { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("CustomerId")]
    [InverseProperty("TestDrives")]
    public virtual Customer Customer { get; set; } = null!;

    [ForeignKey("DealerId")]
    [InverseProperty("TestDrives")]
    public virtual Dealer Dealer { get; set; } = null!;

    [ForeignKey("ProductId")]
    [InverseProperty("TestDrives")]
    public virtual Product? Product { get; set; }
}
