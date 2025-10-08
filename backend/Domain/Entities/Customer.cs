using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("customers", Schema = "evdms")]
[Index("DealerId", Name = "IX_customers_dealer")]
public partial class Customer
{
    [Key]
    [Column("customer_id")]
    public long CustomerId { get; set; }

    [Column("dealer_id")]
    public long DealerId { get; set; }

    [Column("full_name")]
    [StringLength(255)]
    public string FullName { get; set; } = null!;

    [Column("phone")]
    [StringLength(30)]
    public string? Phone { get; set; }

    [Column("email")]
    [StringLength(255)]
    public string? Email { get; set; }

    [Column("id_number")]
    [StringLength(50)]
    public string? IdNumber { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("DealerId")]
    [InverseProperty("Customers")]
    public virtual Dealer Dealer { get; set; } = null!;

    [InverseProperty("Customer")]
    public virtual ICollection<SalesDocument> SalesDocuments { get; set; } = new List<SalesDocument>();

    [InverseProperty("Customer")]
    public virtual ICollection<TestDrife> TestDrives { get; set; } = new List<TestDrife>();
}
