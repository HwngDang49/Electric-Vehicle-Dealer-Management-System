using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("dealer_agreements", Schema = "evdms")]
[Index("DealerId", Name = "IX_agreements_dealer")]
[Index("Code", Name = "UQ__dealer_a__357D4CF95326C8DB", IsUnique = true)]
public partial class DealerAgreement
{
    [Key]
    [Column("agreement_id")]
    public long AgreementId { get; set; }

    [Column("dealer_id")]
    public long DealerId { get; set; }

    [Column("code")]
    [StringLength(50)]
    public string Code { get; set; } = null!;

    [Column("title")]
    [StringLength(255)]
    public string Title { get; set; } = null!;

    [Column("start_date")]
    public DateOnly StartDate { get; set; }

    [Column("end_date")]
    public DateOnly? EndDate { get; set; }

    [Column("payment_terms")]
    [StringLength(100)]
    public string? PaymentTerms { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("file_url")]
    public string? FileUrl { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Agreement")]
    public virtual ICollection<AgreementRebate> AgreementRebates { get; set; } = new List<AgreementRebate>();

    [ForeignKey("DealerId")]
    [InverseProperty("DealerAgreements")]
    public virtual Dealer Dealer { get; set; } = null!;
}
