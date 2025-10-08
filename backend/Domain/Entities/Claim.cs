using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("claims", Schema = "evdms")]
[Index("DealerId", Name = "IX_claims_dealer")]
public partial class Claim
{
    [Key]
    [Column("claim_id")]
    public long ClaimId { get; set; }

    [Column("dealer_id")]
    public long DealerId { get; set; }

    [Column("sales_doc_id")]
    public long? SalesDocId { get; set; }

    [Column("promotion_id")]
    public long? PromotionId { get; set; }

    [Column("amount", TypeName = "decimal(18, 2)")]
    public decimal Amount { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("resolved_at")]
    public DateTime? ResolvedAt { get; set; }

    [ForeignKey("DealerId")]
    [InverseProperty("Claims")]
    public virtual Dealer Dealer { get; set; } = null!;

    [ForeignKey("PromotionId")]
    [InverseProperty("Claims")]
    public virtual Promotion? Promotion { get; set; }

    [ForeignKey("SalesDocId")]
    [InverseProperty("Claims")]
    public virtual SalesDocument? SalesDoc { get; set; }

    [InverseProperty("Claim")]
    public virtual ICollection<Settlement> Settlements { get; set; } = new List<Settlement>();
}
