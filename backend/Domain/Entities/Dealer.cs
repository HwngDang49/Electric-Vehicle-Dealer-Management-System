using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("dealers", Schema = "evdms")]
[Index("Code", Name = "IX_dealers_code")]
[Index("Code", Name = "UQ__dealers__357D4CF9010FDEFE", IsUnique = true)]
public partial class Dealer
{
    [Key]
    [Column("dealer_id")]
    public long DealerId { get; set; }

    [Column("code")]
    [StringLength(50)]
    public string Code { get; set; } = null!;

    [Column("name")]
    [StringLength(255)]
    public string Name { get; set; } = null!;

    [Column("legal_name")]
    [StringLength(500)]
    public string? LegalName { get; set; }

    [Column("tax_id")]
    [StringLength(50)]
    public string? TaxId { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("credit_limit", TypeName = "decimal(18, 2)")]
    public decimal CreditLimit { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("Dealer")]
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    [InverseProperty("Dealer")]
    public virtual ICollection<Branch> Branches { get; set; } = new List<Branch>();

    [InverseProperty("Dealer")]
    public virtual ICollection<Claim> Claims { get; set; } = new List<Claim>();

    [InverseProperty("Dealer")]
    public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();

    [InverseProperty("Dealer")]
    public virtual ICollection<DealerAgreement> DealerAgreements { get; set; } = new List<DealerAgreement>();

    [InverseProperty("Dealer")]
    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    [InverseProperty("Dealer")]
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    [InverseProperty("Dealer")]
    public virtual ICollection<Pricebook> Pricebooks { get; set; } = new List<Pricebook>();

    [InverseProperty("Dealer")]
    public virtual ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();

    [InverseProperty("Dealer")]
    public virtual ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();

    [InverseProperty("Dealer")]
    public virtual ICollection<SalesDocument> SalesDocuments { get; set; } = new List<SalesDocument>();

    [InverseProperty("Dealer")]
    public virtual ICollection<TestDrive> TestDrives { get; set; } = new List<TestDrive>();

    [InverseProperty("Dealer")]
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
