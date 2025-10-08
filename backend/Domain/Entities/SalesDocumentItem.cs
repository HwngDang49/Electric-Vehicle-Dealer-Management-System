using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Domain.Entities;

[Table("sales_document_items", Schema = "evdms")]
[Index("SalesDocId", Name = "IX_sdi_sd")]
[Index("SalesDocId", "ProductId", Name = "UQ_sdi", IsUnique = true)]
public partial class SalesDocumentItem
{
    [Key]
    [Column("sdi_id")]
    public long SdiId { get; set; }

    [Column("sales_doc_id")]
    public long SalesDocId { get; set; }

    [Column("product_id")]
    public long ProductId { get; set; }

    [Column("unit_price", TypeName = "decimal(18, 2)")]
    public decimal UnitPrice { get; set; }

    [Column("qty")]
    public int Qty { get; set; }

    [Column("line_discount", TypeName = "decimal(18, 2)")]
    public decimal LineDiscount { get; set; }

    [Column("line_promo", TypeName = "decimal(18, 2)")]
    public decimal LinePromo { get; set; }

    [Column("line_total", TypeName = "decimal(31, 2)")]
    public decimal? LineTotal { get; set; }

    [InverseProperty("AllocatedSdi")]
    public virtual ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

    [ForeignKey("ProductId")]
    [InverseProperty("SalesDocumentItems")]
    public virtual Product Product { get; set; } = null!;

    [ForeignKey("SalesDocId")]
    [InverseProperty("SalesDocumentItems")]
    public virtual SalesDocument SalesDoc { get; set; } = null!;
}
