using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("sales_documents", Schema = "evdms")]
[Index("CustomerId", Name = "IX_sd_customer")]
[Index("DealerId", "DocType", Name = "IX_sd_dealer_type")]
[Index("Status", "LockedUntil", Name = "IX_sd_status")]
[Index("ContractNo", Name = "UQ__sales_do__F8D7BD39DCD3E176", IsUnique = true)]
public partial class SalesDocument
{
    [Key]
    [Column("sales_doc_id")]
    public long SalesDocId { get; set; }

    [Column("doc_type")]
    [StringLength(10)]
    public string DocType { get; set; } = null!;

    [Column("dealer_id")]
    public long DealerId { get; set; }

    [Column("customer_id")]
    public long CustomerId { get; set; }

    [Column("pricebook_id")]
    public long? PricebookId { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("locked_until")]
    public DateTime? LockedUntil { get; set; }

    [Column("eta_date")]
    public DateOnly? EtaDate { get; set; }

    [Column("deposit_amount", TypeName = "decimal(18, 2)")]
    public decimal DepositAmount { get; set; }

    [Column("total_amount", TypeName = "decimal(18, 2)")]
    public decimal TotalAmount { get; set; }

    [Column("delivered_at")]
    public DateTime? DeliveredAt { get; set; }

    [Column("receiver_name")]
    [StringLength(255)]
    public string? ReceiverName { get; set; }

    [Column("delivery_doc_url")]
    public string? DeliveryDocUrl { get; set; }

    [Column("contract_no")]
    [StringLength(50)]
    public string? ContractNo { get; set; }

    [Column("signed_at")]
    public DateTime? SignedAt { get; set; }

    [Column("contract_file_url")]
    public string? ContractFileUrl { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("SalesDoc")]
    public virtual ICollection<Claim> Claims { get; set; } = new List<Claim>();

    [ForeignKey("CustomerId")]
    [InverseProperty("SalesDocuments")]
    public virtual Customer Customer { get; set; } = null!;

    [ForeignKey("DealerId")]
    [InverseProperty("SalesDocuments")]
    public virtual Dealer Dealer { get; set; } = null!;

    [InverseProperty("SalesDoc")]
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    [ForeignKey("PricebookId")]
    [InverseProperty("SalesDocuments")]
    public virtual Pricebook? Pricebook { get; set; }

    [InverseProperty("SalesDoc")]
    public virtual ICollection<SalesDocumentItem> SalesDocumentItems { get; set; } = new List<SalesDocumentItem>();
}
