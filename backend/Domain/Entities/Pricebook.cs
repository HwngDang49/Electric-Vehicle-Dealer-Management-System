using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("pricebooks", Schema = "evdms")]
[Index("DealerId", Name = "IX_pricebooks_dealer")]
[Index("ProductId", Name = "IX_pricebooks_product")]
[Index("DealerId", "ProductId", "EffectiveFrom", Name = "UQ_pricebooks", IsUnique = true)]
public partial class Pricebook
{
    [Key]
    [Column("pricebook_id")]
    public long PricebookId { get; set; }

    [Column("dealer_id")]
    public long? DealerId { get; set; }

    [Column("product_id")]
    public long ProductId { get; set; }

    [Column("name")]
    [StringLength(255)]
    public string Name { get; set; } = null!;

    [Column("msrp_price", TypeName = "decimal(18, 2)")]
    public decimal MsrpPrice { get; set; }

    [Column("floor_price", TypeName = "decimal(18, 2)")]
    public decimal? FloorPrice { get; set; }

    [Column("effective_from")]
    public DateOnly EffectiveFrom { get; set; }

    [Column("effective_to")]
    public DateOnly? EffectiveTo { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string Status { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("DealerId")]
    [InverseProperty("Pricebooks")]
    public virtual Dealer? Dealer { get; set; }

    [ForeignKey("ProductId")]
    [InverseProperty("Pricebooks")]
    public virtual Product Product { get; set; } = null!;

    [InverseProperty("Pricebook")]
    public virtual ICollection<SalesDocument> SalesDocuments { get; set; } = new List<SalesDocument>();
}
