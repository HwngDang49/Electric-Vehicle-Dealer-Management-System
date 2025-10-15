using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using backend.Domain.Entities;

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

    public virtual DbSet<CustomerActivity> CustomerActivities { get; set; }

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
        //Cho phép nạp tự động mọi class implements IEntityTypeConfiguration<T>
        // trong cùng assembly với DbContext (Infrastructure/Data/EntityTypeConfigs/*)
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EVDmsDbContext).Assembly);

        modelBuilder.Entity<AgreementRebate>(entity =>
        {
            entity.HasKey(e => e.RebateId).HasName("PK__agreemen__48A89884558495CE");

            entity.ToTable("agreement_rebates", "evdms");

            entity.HasIndex(e => new { e.AgreementId, e.Period }, "IX_ar_agreement_period");

            entity.HasIndex(e => new { e.AgreementId, e.Period, e.TierQty }, "IX_ar_tiers").IsDescending(false, false, true);

            entity.Property(e => e.RebateId).HasColumnName("rebate_id");
            entity.Property(e => e.AgreementId).HasColumnName("agreement_id");
            entity.Property(e => e.CapAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("cap_amount");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.Method)
                .HasMaxLength(20)
                .HasDefaultValue("PerUnit")
                .HasColumnName("method");
            entity.Property(e => e.Period)
                .HasMaxLength(20)
                .HasColumnName("period");
            entity.Property(e => e.RebatePerUnit)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("rebate_per_unit");
            entity.Property(e => e.TierQty).HasColumnName("tier_qty");

            entity.HasOne(d => d.Agreement).WithMany(p => p.AgreementRebates)
                .HasForeignKey(d => d.AgreementId)
                .HasConstraintName("FK_ar_agreement");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.AuditId).HasName("PK__audit_lo__5AF33E3377C588FA");

            entity.ToTable("audit_logs", "evdms");

            entity.HasIndex(e => e.DealerId, "IX_audit_dealer");

            entity.HasIndex(e => new { e.EntityName, e.EntityId }, "IX_audit_entity");

            entity.Property(e => e.AuditId).HasColumnName("audit_id");
            entity.Property(e => e.Action)
                .HasMaxLength(50)
                .HasColumnName("action");
            entity.Property(e => e.ChangedData).HasColumnName("changed_data");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.EntityId)
                .HasMaxLength(100)
                .HasColumnName("entity_id");
            entity.Property(e => e.EntityName)
                .HasMaxLength(100)
                .HasColumnName("entity_name");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Dealer).WithMany(p => p.AuditLogs)
                .HasForeignKey(d => d.DealerId)
                .HasConstraintName("FK_audit_dealer");

            entity.HasOne(d => d.User).WithMany(p => p.AuditLogs)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_audit_user");
        });

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.HasKey(e => e.BranchId).HasName("PK__branches__E55E37DEDC03724C");

            entity.ToTable("branches", "evdms");

            entity.HasIndex(e => e.DealerId, "IX_branches_dealer");

            entity.HasIndex(e => new { e.DealerId, e.Code }, "UQ_branches_dealer_code").IsUnique();

            entity.Property(e => e.BranchId).HasColumnName("branch_id");
            entity.Property(e => e.Address).HasColumnName("address");
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .HasColumnName("code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Active")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Branches)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_branches_dealer");
        });

        modelBuilder.Entity<Claim>(entity =>
        {
            entity.HasKey(e => e.ClaimId).HasName("PK__claims__F9CC08968E7C67C9");

            entity.ToTable("claims", "evdms");

            entity.HasIndex(e => e.DealerId, "IX_claims_dealer");

            entity.Property(e => e.ClaimId).HasColumnName("claim_id");
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.PromotionId).HasColumnName("promotion_id");
            entity.Property(e => e.ResolvedAt).HasColumnName("resolved_at");
            entity.Property(e => e.SalesDocId).HasColumnName("sales_doc_id");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Open")
                .HasColumnName("status");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Claims)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_claims_dealer");

            entity.HasOne(d => d.Promotion).WithMany(p => p.Claims)
                .HasForeignKey(d => d.PromotionId)
                .HasConstraintName("FK_claims_promotion");

            entity.HasOne(d => d.SalesDoc).WithMany(p => p.Claims)
                .HasForeignKey(d => d.SalesDocId)
                .HasConstraintName("FK_claims_salesdoc");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId).HasName("PK__customer__CD65CB8508E1D336");

            entity.ToTable("customers", "evdms");

            entity.HasIndex(e => e.DealerId, "IX_customers_dealer");

            entity.HasIndex(e => new { e.DealerId, e.Status }, "IX_customers_status");

            entity.ToTable("customers", "evdms");

            entity.HasIndex(e => e.DealerId, "IX_customers_dealer");

            entity.HasIndex(e => new { e.DealerId, e.Status }, "IX_customers_status");

            entity.HasIndex(e => new { e.DealerId, e.Email }, "UX_customer_email")
                .IsUnique()
                .HasFilter("([email] IS NOT NULL)");

            entity.HasIndex(e => new { e.DealerId, e.Phone }, "UX_customer_phone")
                .IsUnique()
                .HasFilter("([phone] IS NOT NULL)");

            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.Address).HasColumnName("address");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(255)
                .HasColumnName("full_name");
            entity.Property(e => e.IdNumber)
                .HasMaxLength(50)
                .HasColumnName("id_number");
            entity.Property(e => e.Phone)
                .HasMaxLength(30)
                .HasColumnName("phone");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Customers)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_customers_dealer");
        });

        modelBuilder.Entity<CustomerActivity>(entity =>
        {
            entity.HasKey(e => e.ActivityId).HasName("PK__customer__482FBD6353998062");

            entity.ToTable("customer_activities", "evdms");

            entity.HasIndex(e => new { e.CustomerId, e.CreatedAt }, "IX_ca_customer").IsDescending(false, true);

            entity.Property(e => e.ActivityId).HasColumnName("activity_id");
            entity.Property(e => e.Channel)
                .HasMaxLength(10)
                .HasColumnName("channel");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.Direction)
                .HasMaxLength(10)
                .HasColumnName("direction");
            entity.Property(e => e.ProviderMsgId)
                .HasMaxLength(100)
                .HasColumnName("provider_msg_id");
            entity.Property(e => e.RelatedEntity)
                .HasMaxLength(40)
                .HasColumnName("related_entity");
            entity.Property(e => e.RelatedId)
                .HasMaxLength(100)
                .HasColumnName("related_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Sent")
                .HasColumnName("status");
            entity.Property(e => e.Subject)
                .HasMaxLength(255)
                .HasColumnName("subject");
            entity.Property(e => e.Type)
                .HasMaxLength(30)
                .HasColumnName("type");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.CustomerActivities)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__customer___creat__5224328E");

            entity.HasOne(d => d.Customer).WithMany(p => p.CustomerActivities)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__customer___custo__503BEA1C");
        });

        modelBuilder.Entity<Dealer>(entity =>
        {
            entity.HasKey(e => e.DealerId).HasName("PK__dealers__019990C0C0380948");

            entity.ToTable("dealers", "evdms");

            entity.HasIndex(e => e.Code, "IX_dealers_code");

            entity.HasIndex(e => e.Code, "UQ__dealers__357D4CF9010FDEFE").IsUnique();

            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .HasColumnName("code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CreditLimit)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("credit_limit");
            entity.Property(e => e.LegalName)
                .HasMaxLength(500)
                .HasColumnName("legal_name");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Live")
                .HasColumnName("status");
            entity.Property(e => e.TaxId)
                .HasMaxLength(50)
                .HasColumnName("tax_id");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<DealerAgreement>(entity =>
        {
            entity.HasKey(e => e.AgreementId).HasName("PK__dealer_a__A476FBDFB4AEFDB1");

            entity.ToTable("dealer_agreements", "evdms");

            entity.HasIndex(e => e.DealerId, "IX_agreements_dealer");

            entity.HasIndex(e => e.Code, "UQ__dealer_a__357D4CF95326C8DB").IsUnique();

            entity.Property(e => e.AgreementId).HasColumnName("agreement_id");
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .HasColumnName("code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.FileUrl).HasColumnName("file_url");
            entity.Property(e => e.PaymentTerms)
                .HasMaxLength(100)
                .HasColumnName("payment_terms");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Active")
                .HasColumnName("status");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");

            entity.HasOne(d => d.Dealer).WithMany(p => p.DealerAgreements)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_da_dealer");
        });

        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.HasKey(e => e.Vin).HasName("PK__inventor__DDB00C6720966AA8");

            entity.ToTable("inventory", "evdms");

            entity.HasIndex(e => e.AllocatedSdiId, "IX_inv_alloc_sdi").HasFilter("([allocated_sdi_id] IS NOT NULL)");

            entity.HasIndex(e => new { e.LocationType, e.LocationId }, "IX_inv_location");

            entity.HasIndex(e => new { e.OwnerType, e.OwnerId }, "IX_inv_owner");

            entity.HasIndex(e => e.PoId, "IX_inv_po");

            entity.HasIndex(e => e.DealerId, "IX_inventory_dealer");

            entity.HasIndex(e => e.ProductId, "IX_inventory_product");

            entity.HasIndex(e => e.Status, "IX_inventory_status");

            entity.Property(e => e.Vin)
                .HasMaxLength(30)
                .HasColumnName("vin");
            entity.Property(e => e.AllocatedAt).HasColumnName("allocated_at");
            entity.Property(e => e.AllocatedSdiId).HasColumnName("allocated_sdi_id");
            entity.Property(e => e.BranchId).HasColumnName("branch_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.LocationType)
                .HasMaxLength(20)
                .HasColumnName("location_type");
            entity.Property(e => e.OwnerId).HasColumnName("owner_id");
            entity.Property(e => e.OwnerType)
                .HasMaxLength(20)
                .HasDefaultValue("Dealer")
                .HasColumnName("owner_type");
            entity.Property(e => e.PdiCheckedAt).HasColumnName("pdi_checked_at");
            entity.Property(e => e.PdiCheckedBy).HasColumnName("pdi_checked_by");
            entity.Property(e => e.PdiResult)
                .HasMaxLength(20)
                .HasColumnName("pdi_result");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.PoItemId).HasColumnName("po_item_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.ReceivedAt).HasColumnName("received_at");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("InStock")
                .HasColumnName("status");

            entity.HasOne(d => d.AllocatedSdi).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.AllocatedSdiId)
                .HasConstraintName("FK_inv_alloc_sdi");

            entity.HasOne(d => d.Branch).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.BranchId)
                .HasConstraintName("FK_inv_branch");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.DealerId)
                .HasConstraintName("FK_inv_dealer");

            entity.HasOne(d => d.PdiCheckedByNavigation).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.PdiCheckedBy)
                .HasConstraintName("FK_inv_pdi_user");

            entity.HasOne(d => d.Po).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.PoId)
                .HasConstraintName("FK_inv_po");

            entity.HasOne(d => d.PoItem).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.PoItemId)
                .HasConstraintName("FK_inv_po_item");

            entity.HasOne(d => d.Product).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_inv_product");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.InvoiceId).HasName("PK__invoices__F58DFD49E317DA73");

            entity.ToTable("invoices", "evdms");

            entity.HasIndex(e => e.PoId, "IX_invoices_po");

            entity.HasIndex(e => e.SalesDocId, "IX_invoices_salesdoc");

            entity.HasIndex(e => new { e.InvoiceType, e.Status, e.DueAt }, "IX_invoices_type");

            entity.HasIndex(e => e.InvoiceNo, "UQ__invoices__F58CA1E2909AAE11").IsUnique();

            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.Currency)
                .HasMaxLength(10)
                .HasDefaultValue("VND")
                .HasColumnName("currency");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.DueAt).HasColumnName("due_at");
            entity.Property(e => e.InvoiceNo)
                .HasMaxLength(50)
                .HasColumnName("invoice_no");
            entity.Property(e => e.InvoiceType)
                .HasMaxLength(10)
                .HasDefaultValue("Retail")
                .HasColumnName("invoice_type");
            entity.Property(e => e.IssuedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("issued_at");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.SalesDocId).HasColumnName("sales_doc_id");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending")
                .HasColumnName("status");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_invoices_dealer");

            entity.HasOne(d => d.Po).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.PoId)
                .HasConstraintName("FK_inv_b2b_po");

            entity.HasOne(d => d.SalesDoc).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.SalesDocId)
                .HasConstraintName("FK_inv_retail_salesdoc");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__payments__ED1FC9EA68B9F2F5");

            entity.ToTable("payments", "evdms");

            entity.HasIndex(e => e.InvoiceId, "IX_payments_invoice");

            entity.Property(e => e.PaymentId).HasColumnName("payment_id");
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.Method)
                .HasMaxLength(50)
                .HasColumnName("method");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.PaidAt).HasColumnName("paid_at");
            entity.Property(e => e.ReferenceNo)
                .HasMaxLength(100)
                .HasColumnName("reference_no");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Captured")
                .HasColumnName("status");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Payments)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_payments_user");

            entity.HasOne(d => d.Invoice).WithMany(p => p.Payments)
                .HasForeignKey(d => d.InvoiceId)
                .HasConstraintName("FK_payments_invoice");
        });

        modelBuilder.Entity<PoItem>(entity =>
        {
            entity.HasKey(e => e.PoItemId).HasName("PK__po_items__E2A58305AA16820D");

            entity.ToTable("po_items", "evdms");

            entity.HasIndex(e => e.PoId, "IX_poi_po");

            entity.HasIndex(e => new { e.PoId, e.ProductId }, "UQ_poi").IsUnique();

            entity.Property(e => e.PoItemId).HasColumnName("po_item_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.LineTotal)
                .HasComputedColumnSql("([qty]*[unit_wholesale])", true)
                .HasColumnType("decimal(29, 2)")
                .HasColumnName("line_total");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Qty)
                .HasDefaultValue(1)
                .HasColumnName("qty");
            entity.Property(e => e.UnitWholesale)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("unit_wholesale");

            entity.HasOne(d => d.Po).WithMany(p => p.PoItems)
                .HasForeignKey(d => d.PoId)
                .HasConstraintName("FK_poi_po");

            entity.HasOne(d => d.Product).WithMany(p => p.PoItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_poi_product");
        });

        modelBuilder.Entity<Pricebook>(entity =>
        {
            entity.HasKey(e => e.PricebookId).HasName("PK__priceboo__0DDE58F152448DB9");

            entity.ToTable("pricebooks", "evdms");

            entity.HasIndex(e => e.DealerId, "IX_pricebooks_dealer");

            entity.HasIndex(e => e.ProductId, "IX_pricebooks_product");

            entity.HasIndex(e => new { e.DealerId, e.ProductId, e.EffectiveFrom }, "UQ_pricebooks").IsUnique();

            entity.Property(e => e.PricebookId).HasColumnName("pricebook_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.EffectiveFrom).HasColumnName("effective_from");
            entity.Property(e => e.EffectiveTo).HasColumnName("effective_to");
            entity.Property(e => e.FloorPrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("floor_price");
            entity.Property(e => e.MsrpPrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("msrp_price");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Active")
                .HasColumnName("status");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Pricebooks)
                .HasForeignKey(d => d.DealerId)
                .HasConstraintName("FK_pricebooks_dealer");

            entity.HasOne(d => d.Product).WithMany(p => p.Pricebooks)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_pricebooks_product");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__products__47027DF51C6B40BD");

            entity.ToTable("products", "evdms");

            entity.HasIndex(e => new { e.ModelCode, e.VariantCode }, "IX_products_model");

            entity.HasIndex(e => e.ProductCode, "UQ__products__AE1A8CC49DEED32D").IsUnique();

            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.BatteryKwh)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("battery_kwh");
            entity.Property(e => e.ColorCode)
                .HasMaxLength(50)
                .HasColumnName("color_code");
            entity.Property(e => e.ColorName)
                .HasMaxLength(100)
                .HasColumnName("color_name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.ModelCode)
                .HasMaxLength(50)
                .HasColumnName("model_code");
            entity.Property(e => e.ModelName)
                .HasMaxLength(255)
                .HasColumnName("model_name");
            entity.Property(e => e.MotorKw)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("motor_kw");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.ProductCode)
                .HasMaxLength(50)
                .HasColumnName("product_code");
            entity.Property(e => e.RangeKm).HasColumnName("range_km");
            entity.Property(e => e.VariantCode)
                .HasMaxLength(50)
                .HasColumnName("variant_code");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__promotio__2CB9556B7A4C5020");

            entity.ToTable("promotions", "evdms");

            entity.HasIndex(e => new { e.EffectiveFrom, e.EffectiveTo }, "IX_promotions_dates");

            entity.HasIndex(e => e.DealerId, "IX_promotions_dealer");

            entity.HasIndex(e => e.Code, "UQ__promotio__357D4CF95C454DD6").IsUnique();

            entity.Property(e => e.PromotionId).HasColumnName("promotion_id");
            entity.Property(e => e.BudgetTotal)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("budget_total");
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .HasColumnName("code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.EffectiveFrom).HasColumnName("effective_from");
            entity.Property(e => e.EffectiveTo).HasColumnName("effective_to");
            entity.Property(e => e.FundedBy)
                .HasMaxLength(50)
                .HasDefaultValue("Manufacturer")
                .HasColumnName("funded_by");
            entity.Property(e => e.MaxAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("max_amount");
            entity.Property(e => e.MinPrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("min_price");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.RuleType)
                .HasMaxLength(50)
                .HasColumnName("rule_type");
            entity.Property(e => e.StackingRule)
                .HasMaxLength(50)
                .HasDefaultValue("Stackable")
                .HasColumnName("stacking_rule");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Active")
                .HasColumnName("status");
            entity.Property(e => e.ValueNum)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("value_num");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Promotions)
                .HasForeignKey(d => d.DealerId)
                .HasConstraintName("FK_promotions_dealer");
        });

        modelBuilder.Entity<PromotionScope>(entity =>
        {
            entity.HasKey(e => e.PromotionScopeId).HasName("PK__promotio__48F4099D6CA5F4FA");

            entity.ToTable("promotion_scopes", "evdms");

            entity.HasIndex(e => new { e.PromotionId, e.ProductId, e.BranchId, e.RegionCode }, "UQ_promo_scopes").IsUnique();

            entity.Property(e => e.PromotionScopeId).HasColumnName("promotion_scope_id");
            entity.Property(e => e.BranchId).HasColumnName("branch_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.PromotionId).HasColumnName("promotion_id");
            entity.Property(e => e.RegionCode)
                .HasMaxLength(50)
                .HasColumnName("region_code");

            entity.HasOne(d => d.Branch).WithMany(p => p.PromotionScopes)
                .HasForeignKey(d => d.BranchId)
                .HasConstraintName("FK_ps_branch");

            entity.HasOne(d => d.Product).WithMany(p => p.PromotionScopes)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK_ps_product");

            entity.HasOne(d => d.Promotion).WithMany(p => p.PromotionScopes)
                .HasForeignKey(d => d.PromotionId)
                .HasConstraintName("FK_ps_promotion");
        });

        modelBuilder.Entity<PurchaseOrder>(entity =>
        {
            entity.HasKey(e => e.PoId).HasName("PK__purchase__368DA7F0B5E5D644");

            entity.ToTable("purchase_orders", "evdms");

            entity.HasIndex(e => new { e.DealerId, e.Status }, "IX_po_dealer_status");

            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.ApprovedBy).HasColumnName("approved_by");
            entity.Property(e => e.BranchId).HasColumnName("branch_id");
            entity.Property(e => e.ConfirmedBy).HasColumnName("confirmed_by");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.ExpectedDate).HasColumnName("expected_date");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Draft")
                .HasColumnName("status");
            entity.Property(e => e.SubmittedBy).HasColumnName("submitted_by");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.PurchaseOrderApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK_po_approved");

            entity.HasOne(d => d.Branch).WithMany(p => p.PurchaseOrders)
                .HasForeignKey(d => d.BranchId)
                .HasConstraintName("FK_po_branch");

            entity.HasOne(d => d.ConfirmedByNavigation).WithMany(p => p.PurchaseOrderConfirmedByNavigations)
                .HasForeignKey(d => d.ConfirmedBy)
                .HasConstraintName("FK_po_confirmed");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.PurchaseOrderCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_po_created");

            entity.HasOne(d => d.Dealer).WithMany(p => p.PurchaseOrders)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_po_dealer");

            entity.HasOne(d => d.SubmittedByNavigation).WithMany(p => p.PurchaseOrderSubmittedByNavigations)
                .HasForeignKey(d => d.SubmittedBy)
                .HasConstraintName("FK_po_submitted");
        });

        modelBuilder.Entity<SalesDocument>(entity =>
        {
            entity.HasKey(e => e.SalesDocId).HasName("PK__sales_do__CDEC34CFF7D020F0");

            entity.ToTable("sales_documents", "evdms");

            entity.HasIndex(e => e.CustomerId, "IX_sd_customer");

            entity.HasIndex(e => new { e.DealerId, e.DocType }, "IX_sd_dealer_type");

            entity.HasIndex(e => new { e.Status, e.LockedUntil }, "IX_sd_status");

            entity.HasIndex(e => e.ContractNo, "UX_sales_documents_contract_no")
                .IsUnique()
                .HasFilter("([contract_no] IS NOT NULL)");

            entity.Property(e => e.SalesDocId).HasColumnName("sales_doc_id");
            entity.Property(e => e.ContractFileUrl).HasColumnName("contract_file_url");
            entity.Property(e => e.ContractNo)
                .HasMaxLength(50)
                .HasColumnName("contract_no");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.DeliveredAt).HasColumnName("delivered_at");
            entity.Property(e => e.DeliveryDocUrl).HasColumnName("delivery_doc_url");
            entity.Property(e => e.DepositAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("deposit_amount");
            entity.Property(e => e.DocType)
                .HasMaxLength(10)
                .HasDefaultValue("Quote")
                .HasColumnName("doc_type");
            entity.Property(e => e.EtaDate).HasColumnName("eta_date");
            entity.Property(e => e.LockedUntil).HasColumnName("locked_until");
            entity.Property(e => e.PricebookId).HasColumnName("pricebook_id");
            entity.Property(e => e.ReceiverName)
                .HasMaxLength(255)
                .HasColumnName("receiver_name");
            entity.Property(e => e.RequiredDepositAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("required_deposit_amount");
            entity.Property(e => e.SignedAt).HasColumnName("signed_at");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Draft")
                .HasColumnName("status");
            entity.Property(e => e.TotalAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("total_amount");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Customer).WithMany(p => p.SalesDocuments)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_sd_customer");

            entity.HasOne(d => d.Dealer).WithMany(p => p.SalesDocuments)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_sd_dealer");

            entity.HasOne(d => d.Pricebook).WithMany(p => p.SalesDocuments)
                .HasForeignKey(d => d.PricebookId)
                .HasConstraintName("FK_sd_pricebook");
        });

        modelBuilder.Entity<SalesDocumentItem>(entity =>
        {
            entity.HasKey(e => e.SdiId).HasName("PK__sales_do__E07AC109B28F386C");

            entity.ToTable("sales_document_items", "evdms");

            entity.HasIndex(e => e.SalesDocId, "IX_sdi_sd");

            entity.HasIndex(e => new { e.SalesDocId, e.ProductId }, "UQ_sdi").IsUnique();

            entity.Property(e => e.SdiId).HasColumnName("sdi_id");
            entity.Property(e => e.LineDiscount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("line_discount");
            entity.Property(e => e.LinePromo)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("line_promo");
            entity.Property(e => e.LineTotal)
                .HasComputedColumnSql("(([unit_price]*[qty]-[line_discount])-[line_promo])", true)
                .HasColumnType("decimal(31, 2)")
                .HasColumnName("line_total");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Qty)
                .HasDefaultValue(1)
                .HasColumnName("qty");
            entity.Property(e => e.SalesDocId).HasColumnName("sales_doc_id");
            entity.Property(e => e.UnitPrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("unit_price");

            entity.HasOne(d => d.Product).WithMany(p => p.SalesDocumentItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_sdi_prod");

            entity.HasOne(d => d.SalesDoc).WithMany(p => p.SalesDocumentItems)
                .HasForeignKey(d => d.SalesDocId)
                .HasConstraintName("FK_sdi_sd");
        });

        modelBuilder.Entity<Settlement>(entity =>
        {
            entity.HasKey(e => e.SettlementId).HasName("PK__settleme__9BB6D70877E5D7DD");

            entity.ToTable("settlements", "evdms");

            entity.Property(e => e.SettlementId).HasColumnName("settlement_id");
            entity.Property(e => e.ClaimId).HasColumnName("claim_id");
            entity.Property(e => e.PaidAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("paid_amount");
            entity.Property(e => e.PaidAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("paid_at");
            entity.Property(e => e.ReferenceNo)
                .HasMaxLength(100)
                .HasColumnName("reference_no");

            entity.HasOne(d => d.Claim).WithMany(p => p.Settlements)
                .HasForeignKey(d => d.ClaimId)
                .HasConstraintName("FK_settlements_claim");
        });

        modelBuilder.Entity<TestDrife>(entity =>
        {
            entity.HasKey(e => e.TestDriveId).HasName("PK__test_dri__7AC61E3042A24E85");

            entity.ToTable("test_drives", "evdms");

            entity.HasIndex(e => e.CustomerId, "IX_td_customer");

            entity.HasIndex(e => e.DealerId, "IX_td_dealer");

            entity.ToTable("test_drives", "evdms");

            entity.HasIndex(e => e.CustomerId, "IX_td_customer");

            entity.HasIndex(e => e.DealerId, "IX_td_dealer");

            entity.Property(e => e.TestDriveId).HasColumnName("test_drive_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.ScheduledAt).HasColumnName("scheduled_at");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Scheduled")
                .HasColumnName("status");

            entity.HasOne(d => d.Customer).WithMany(p => p.TestDrives)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_td_customer");

            entity.HasOne(d => d.Dealer).WithMany(p => p.TestDrives)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_td_dealer");

            entity.HasOne(d => d.Product).WithMany(p => p.TestDrives)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK_td_product");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__users__B9BE370FFE9FD49B");

            entity.ToTable("users", "evdms");

            entity.HasIndex(e => e.BranchId, "IX_users_branch");

            entity.HasIndex(e => e.DealerId, "IX_users_dealer");

            entity.HasIndex(e => e.Role, "IX_users_role");

            entity.HasIndex(e => e.Email, "UQ__users__AB6E6164F81F0211").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.BranchId).HasColumnName("branch_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(255)
                .HasColumnName("full_name");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.Role)
                .HasMaxLength(30)
                .HasDefaultValue("Admin")
                .HasColumnName("role");
            entity.Property(e => e.Salting)
                .HasMaxLength(255)
                .HasColumnName("salting");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Active")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Branch).WithMany(p => p.Users)
                .HasForeignKey(d => d.BranchId)
                .HasConstraintName("FK_users_branch");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Users)
                .HasForeignKey(d => d.DealerId)
                .HasConstraintName("FK_users_dealer");
        });

        modelBuilder.Entity<VB2bInvoiceSummary>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("v_b2b_invoice_summary", "evdms");

            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.DueAt).HasColumnName("due_at");
            entity.Property(e => e.InvoiceAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("invoice_amount");
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.InvoiceNo)
                .HasMaxLength(50)
                .HasColumnName("invoice_no");
            entity.Property(e => e.IssuedAt).HasColumnName("issued_at");
            entity.Property(e => e.OutstandingAmount)
                .HasColumnType("decimal(38, 2)")
                .HasColumnName("outstanding_amount");
            entity.Property(e => e.PaidAmount)
                .HasColumnType("decimal(38, 2)")
                .HasColumnName("paid_amount");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasColumnName("status");
        });

        modelBuilder.Entity<VRebateCalc>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("v_rebate_calc", "evdms");

            entity.Property(e => e.AgreementId).HasColumnName("agreement_id");
            entity.Property(e => e.CapAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("cap_amount");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.EffectiveTierQty).HasColumnName("effective_tier_qty");
            entity.Property(e => e.GrossRebateAmount)
                .HasColumnType("decimal(29, 2)")
                .HasColumnName("gross_rebate_amount");
            entity.Property(e => e.PayableRebateAmount)
                .HasColumnType("decimal(29, 2)")
                .HasColumnName("payable_rebate_amount");
            entity.Property(e => e.Period)
                .HasMaxLength(20)
                .HasColumnName("period");
            entity.Property(e => e.RebatePerUnit)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("rebate_per_unit");
            entity.Property(e => e.UnitsDelivered).HasColumnName("units_delivered");
        });

        modelBuilder.Entity<VRebatePeriodSale>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("v_rebate_period_sales", "evdms");

            entity.Property(e => e.AgreementId).HasColumnName("agreement_id");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.OrderCount).HasColumnName("order_count");
            entity.Property(e => e.Period)
                .HasMaxLength(20)
                .HasColumnName("period");
            entity.Property(e => e.RetailRevenue)
                .HasColumnType("decimal(38, 2)")
                .HasColumnName("retail_revenue");
            entity.Property(e => e.UnitsDelivered).HasColumnName("units_delivered");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
