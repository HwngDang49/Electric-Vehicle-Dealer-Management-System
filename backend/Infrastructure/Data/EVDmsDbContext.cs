﻿using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Data;

public partial class EVDmsDbContext : DbContext
{
    public EVDmsDbContext()
    {
    }

    public EVDmsDbContext(DbContextOptions<EVDmsDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AgreementRebate> AgreementRebates { get; set; }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<Branch> Branches { get; set; }

    public virtual DbSet<Claim> Claims { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Dealer> Dealers { get; set; }

    public virtual DbSet<DealerAgreement> DealerAgreements { get; set; }

    public virtual DbSet<Inventory> Inventories { get; set; }

    public virtual DbSet<Invoice> Invoices { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<PoItem> PoItems { get; set; }

    public virtual DbSet<Pricebook> Pricebooks { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<Promotion> Promotions { get; set; }

    public virtual DbSet<PromotionScope> PromotionScopes { get; set; }

    public virtual DbSet<PurchaseOrder> PurchaseOrders { get; set; }

    public virtual DbSet<SalesDocument> SalesDocuments { get; set; }

    public virtual DbSet<SalesDocumentItem> SalesDocumentItems { get; set; }

    public virtual DbSet<Settlement> Settlements { get; set; }

    public virtual DbSet<TestDrife> TestDrives { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<VB2bInvoiceSummary> VB2bInvoiceSummaries { get; set; }

    public virtual DbSet<VRebateCalc> VRebateCalcs { get; set; }

    public virtual DbSet<VRebatePeriodSale> VRebatePeriodSales { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AgreementRebate>(entity =>
        {
            entity.HasKey(e => e.RebateId).HasName("PK__agreemen__48A89884558495CE");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Method).HasDefaultValue("PerUnit");

            entity.HasOne(d => d.Agreement).WithMany(p => p.AgreementRebates).HasConstraintName("FK_ar_agreement");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.AuditId).HasName("PK__audit_lo__5AF33E3377C588FA");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Dealer).WithMany(p => p.AuditLogs).HasConstraintName("FK_audit_dealer");

            entity.HasOne(d => d.User).WithMany(p => p.AuditLogs).HasConstraintName("FK_audit_user");
        });

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.HasKey(e => e.BranchId).HasName("PK__branches__E55E37DEDC03724C");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Active");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Branches)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_branches_dealer");
        });

        modelBuilder.Entity<Claim>(entity =>
        {
            entity.HasKey(e => e.ClaimId).HasName("PK__claims__F9CC08968E7C67C9");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Open");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Claims)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_claims_dealer");

            entity.HasOne(d => d.Promotion).WithMany(p => p.Claims).HasConstraintName("FK_claims_promotion");

            entity.HasOne(d => d.SalesDoc).WithMany(p => p.Claims).HasConstraintName("FK_claims_salesdoc");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId).HasName("PK__customer__CD65CB85E6F8CE41");

            entity.HasIndex(e => new { e.DealerId, e.Email }, "UX_customer_email")
                .IsUnique()
                .HasFilter("([email] IS NOT NULL)");

            entity.HasIndex(e => new { e.DealerId, e.Phone }, "UX_customer_phone")
                .IsUnique()
                .HasFilter("([phone] IS NOT NULL)");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Customers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_customers_dealer");
        });

        modelBuilder.Entity<Dealer>(entity =>
        {
            entity.HasKey(e => e.DealerId).HasName("PK__dealers__019990C0C0380948");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Live");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");
        });

        modelBuilder.Entity<DealerAgreement>(entity =>
        {
            entity.HasKey(e => e.AgreementId).HasName("PK__dealer_a__A476FBDFB4AEFDB1");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Active");

            entity.HasOne(d => d.Dealer).WithMany(p => p.DealerAgreements)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_da_dealer");
        });

        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.HasKey(e => e.Vin).HasName("PK__inventor__DDB00C6720966AA8");

            entity.HasIndex(e => e.AllocatedSdiId, "IX_inv_alloc_sdi").HasFilter("([allocated_sdi_id] IS NOT NULL)");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.OwnerType).HasDefaultValue("Dealer");
            entity.Property(e => e.Status).HasDefaultValue("InStock");

            entity.HasOne(d => d.AllocatedSdi).WithMany(p => p.Inventories).HasConstraintName("FK_inv_alloc_sdi");

            entity.HasOne(d => d.Branch).WithMany(p => p.Inventories).HasConstraintName("FK_inv_branch");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Inventories).HasConstraintName("FK_inv_dealer");

            entity.HasOne(d => d.PdiCheckedByNavigation).WithMany(p => p.Inventories).HasConstraintName("FK_inv_pdi_user");

            entity.HasOne(d => d.Po).WithMany(p => p.Inventories).HasConstraintName("FK_inv_po");

            entity.HasOne(d => d.PoItem).WithMany(p => p.Inventories).HasConstraintName("FK_inv_po_item");

            entity.HasOne(d => d.Product).WithMany(p => p.Inventories)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_inv_product");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.InvoiceId).HasName("PK__invoices__F58DFD49E317DA73");

            entity.Property(e => e.Currency).HasDefaultValue("VND");
            entity.Property(e => e.InvoiceType).HasDefaultValue("Retail");
            entity.Property(e => e.IssuedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Pending");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Invoices)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_invoices_dealer");

            entity.HasOne(d => d.Po).WithMany(p => p.Invoices).HasConstraintName("FK_inv_b2b_po");

            entity.HasOne(d => d.SalesDoc).WithMany(p => p.Invoices).HasConstraintName("FK_inv_retail_salesdoc");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__payments__ED1FC9EA68B9F2F5");

            entity.Property(e => e.Status).HasDefaultValue("Captured");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Payments).HasConstraintName("FK_payments_user");

            entity.HasOne(d => d.Invoice).WithMany(p => p.Payments).HasConstraintName("FK_payments_invoice");
        });

        modelBuilder.Entity<PoItem>(entity =>
        {
            entity.HasKey(e => e.PoItemId).HasName("PK__po_items__E2A58305AA16820D");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.LineTotal).HasComputedColumnSql("([qty]*[unit_wholesale])", true);
            entity.Property(e => e.Qty).HasDefaultValue(1);

            entity.HasOne(d => d.Po).WithMany(p => p.PoItems).HasConstraintName("FK_poi_po");

            entity.HasOne(d => d.Product).WithMany(p => p.PoItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_poi_product");
        });

        modelBuilder.Entity<Pricebook>(entity =>
        {
            entity.HasKey(e => e.PricebookId).HasName("PK__priceboo__0DDE58F152448DB9");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Active");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Pricebooks).HasConstraintName("FK_pricebooks_dealer");

            entity.HasOne(d => d.Product).WithMany(p => p.Pricebooks)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_pricebooks_product");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__products__47027DF51C6B40BD");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__promotio__2CB9556B7A4C5020");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.FundedBy).HasDefaultValue("Manufacturer");
            entity.Property(e => e.StackingRule).HasDefaultValue("Stackable");
            entity.Property(e => e.Status).HasDefaultValue("Active");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Promotions).HasConstraintName("FK_promotions_dealer");
        });

        modelBuilder.Entity<PromotionScope>(entity =>
        {
            entity.HasKey(e => e.PromotionScopeId).HasName("PK__promotio__48F4099D8E6D3C96");

            entity.HasOne(d => d.Branch).WithMany(p => p.PromotionScopes).HasConstraintName("FK_ps_branch");

            entity.HasOne(d => d.Product).WithMany(p => p.PromotionScopes).HasConstraintName("FK_ps_product");

            entity.HasOne(d => d.Promotion).WithMany(p => p.PromotionScopes).HasConstraintName("FK_ps_promotion");
        });

        modelBuilder.Entity<PurchaseOrder>(entity =>
        {
            entity.HasKey(e => e.PoId).HasName("PK__purchase__368DA7F0B5E5D644");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Draft");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.PurchaseOrderApprovedByNavigations).HasConstraintName("FK_po_approved");

            entity.HasOne(d => d.Branch).WithMany(p => p.PurchaseOrders).HasConstraintName("FK_po_branch");

            entity.HasOne(d => d.ConfirmedByNavigation).WithMany(p => p.PurchaseOrderConfirmedByNavigations).HasConstraintName("FK_po_confirmed");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.PurchaseOrderCreatedByNavigations)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_po_created");

            entity.HasOne(d => d.Dealer).WithMany(p => p.PurchaseOrders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_po_dealer");

            entity.HasOne(d => d.SubmittedByNavigation).WithMany(p => p.PurchaseOrderSubmittedByNavigations).HasConstraintName("FK_po_submitted");
        });

        modelBuilder.Entity<SalesDocument>(entity =>
        {
            entity.HasKey(e => e.SalesDocId).HasName("PK__sales_do__CDEC34CFFF470C6E");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.DocType).HasDefaultValue("Quote");
            entity.Property(e => e.Status).HasDefaultValue("Draft");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Customer).WithMany(p => p.SalesDocuments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_sd_customer");

            entity.HasOne(d => d.Dealer).WithMany(p => p.SalesDocuments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_sd_dealer");

            entity.HasOne(d => d.Pricebook).WithMany(p => p.SalesDocuments).HasConstraintName("FK_sd_pricebook");
        });

        modelBuilder.Entity<SalesDocumentItem>(entity =>
        {
            entity.HasKey(e => e.SdiId).HasName("PK__sales_do__E07AC109B28F386C");

            entity.Property(e => e.LineTotal).HasComputedColumnSql("(([unit_price]*[qty]-[line_discount])-[line_promo])", true);
            entity.Property(e => e.Qty).HasDefaultValue(1);

            entity.HasOne(d => d.Product).WithMany(p => p.SalesDocumentItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_sdi_prod");

            entity.HasOne(d => d.SalesDoc).WithMany(p => p.SalesDocumentItems).HasConstraintName("FK_sdi_sd");
        });

        modelBuilder.Entity<Settlement>(entity =>
        {
            entity.HasKey(e => e.SettlementId).HasName("PK__settleme__9BB6D70877E5D7DD");

            entity.Property(e => e.PaidAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Claim).WithMany(p => p.Settlements).HasConstraintName("FK_settlements_claim");
        });

        modelBuilder.Entity<TestDrife>(entity =>
        {
            entity.HasKey(e => e.TestDriveId).HasName("PK__test_dri__7AC61E3012B99860");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Scheduled");

            entity.HasOne(d => d.Customer).WithMany(p => p.TestDrives)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_td_customer");

            entity.HasOne(d => d.Dealer).WithMany(p => p.TestDrives)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_td_dealer");

            entity.HasOne(d => d.Product).WithMany(p => p.TestDrives).HasConstraintName("FK_td_product");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__users__B9BE370FFE9FD49B");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Role).HasDefaultValue("Admin");
            entity.Property(e => e.Status).HasDefaultValue("Active");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Branch).WithMany(p => p.Users).HasConstraintName("FK_users_branch");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Users).HasConstraintName("FK_users_dealer");
        });

        modelBuilder.Entity<VB2bInvoiceSummary>(entity =>
        {
            entity.ToView("v_b2b_invoice_summary", "evdms");
        });

        modelBuilder.Entity<VRebateCalc>(entity =>
        {
            entity.ToView("v_rebate_calc", "evdms");
        });

        modelBuilder.Entity<VRebatePeriodSale>(entity =>
        {
            entity.ToView("v_rebate_period_sales", "evdms");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
