using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("settlements", Schema = "evdms")]
public partial class Settlement
{
    [Key]
    [Column("settlement_id")]
    public long SettlementId { get; set; }

    [Column("claim_id")]
    public long ClaimId { get; set; }

    [Column("paid_amount", TypeName = "decimal(18, 2)")]
    public decimal PaidAmount { get; set; }

    [Column("paid_at")]
    public DateTime PaidAt { get; set; }

    [Column("reference_no")]
    [StringLength(100)]
    public string? ReferenceNo { get; set; }

    [ForeignKey("ClaimId")]
    [InverseProperty("Settlements")]
    public virtual Claim Claim { get; set; } = null!;
}
