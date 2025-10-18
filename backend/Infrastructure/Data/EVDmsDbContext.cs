using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using backend.Domain.Entities;

namespace backend.Infrastructure.Data;

public partial class EVDmsDbContext : DbContext
{
    public EVDmsDbContext(DbContextOptions<EVDmsDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AgreementRebate> AgreementRebates { get; set; }

    public virtual DbSet<Branch> Branches { get; set; }

    public virtual DbSet<Claim> Claims { get; set; }

    public virtual DbSet<Contract> Contracts { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Dealer> Dealers { get; set; }

    public virtual DbSet<DealerAgreement> DealerAgreements { get; set; }

    public virtual DbSet<Inventory> Inventories { get; set; }

    public virtual DbSet<Invoice> Invoices { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<PoItem> PoItems { get; set; }

    public virtual DbSet<Pricebook> Pricebooks { get; set; }

    public virtual DbSet<PricebookItem> PricebookItems { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<PurchaseOrder> PurchaseOrders { get; set; }

    public virtual DbSet<Quote> Quotes { get; set; }

    public virtual DbSet<QuoteItem> QuoteItems { get; set; }

    public virtual DbSet<Settlement> Settlements { get; set; }

    public virtual DbSet<TestDrife> TestDrives { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<VInvoiceBalance> VInvoiceBalances { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AgreementRebate>(entity =>
        {
            entity.HasKey(e => e.RebateId).HasName("PK__agreemen__48A898843B9EA2A7");

            entity.ToTable("agreement_rebates");

            entity.HasIndex(e => new { e.AgreementId, e.Period }, "IX_ar_agreement_period");

            entity.Property(e => e.RebateId).HasColumnName("rebate_id");
            entity.Property(e => e.AgreementId).HasColumnName("agreement_id");
            entity.Property(e => e.CapAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("cap_amount");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
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

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.HasKey(e => e.BranchId).HasName("PK__branches__E55E37DE4B6621F9");

            entity.ToTable("branches");

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
            entity.HasKey(e => e.ClaimId).HasName("PK__claims__F9CC0896C243BE67");

            entity.ToTable("claims");

            entity.HasIndex(e => new { e.DealerId, e.Status }, "IX_claims_dealer_status");

            entity.Property(e => e.ClaimId).HasColumnName("claim_id");
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PromotionId).HasColumnName("promotion_id");
            entity.Property(e => e.ResolvedAt).HasColumnName("resolved_at");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending")
                .HasColumnName("status");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Claims)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_claims_dealer");

            entity.HasOne(d => d.Order).WithMany(p => p.Claims)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_claims_order");
        });

        modelBuilder.Entity<Contract>(entity =>
        {
            entity.HasKey(e => e.ContractId).HasName("PK__contract__F8D66423613CD4F8");

            entity.ToTable("contracts");

            entity.HasIndex(e => e.ContractNo, "UQ__contract__F8D7BD39270FF21F").IsUnique();

            entity.Property(e => e.ContractId).HasColumnName("contract_id");
            entity.Property(e => e.ContractNo)
                .HasMaxLength(50)
                .HasColumnName("contract_no");
            entity.Property(e => e.FileUrl).HasColumnName("file_url");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.SignedAt).HasColumnName("signed_at");

            entity.HasOne(d => d.Order).WithMany(p => p.Contracts)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_contracts_order");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId).HasName("PK__customer__CD65CB856E2A243F");

            entity.ToTable("customers");

            entity.HasIndex(e => e.DealerId, "IX_customers_dealer");

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
                .HasDefaultValue("Contact")
                .HasColumnName("status");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Customers)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_customers_dealer");
        });

        modelBuilder.Entity<Dealer>(entity =>
        {
            entity.HasKey(e => e.DealerId).HasName("PK__dealers__019990C079517E31");

            entity.ToTable("dealers");

            entity.HasIndex(e => e.Code, "IX_dealers_code");

            entity.HasIndex(e => e.Code, "UQ__dealers__357D4CF94DB7481A").IsUnique();

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
                .HasDefaultValue("Onboarding")
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
            entity.HasKey(e => e.AgreementId).HasName("PK__dealer_a__A476FBDF27D5EC98");

            entity.ToTable("dealer_agreements");

            entity.HasIndex(e => e.DealerId, "IX_agreements_dealer");

            entity.HasIndex(e => e.Code, "UQ__dealer_a__357D4CF930BEF175").IsUnique();

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
            entity.HasKey(e => e.Vin).HasName("PK__inventor__DDB00C671FD5F24E");

            entity.ToTable("inventory");

            entity.HasIndex(e => new { e.LocationType, e.LocationId }, "IX_inv_location");

            entity.HasIndex(e => new { e.OwnerType, e.OwnerId }, "IX_inv_owner");

            entity.HasIndex(e => e.DealerId, "IX_inventory_dealer");

            entity.HasIndex(e => e.ProductId, "IX_inventory_product");

            entity.HasIndex(e => e.Status, "IX_inventory_status");

            entity.Property(e => e.Vin)
                .HasMaxLength(30)
                .HasColumnName("vin");
            entity.Property(e => e.BranchId).HasColumnName("branch_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.LocationType)
                .HasMaxLength(20)
                .HasColumnName("location_type");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.OwnerId).HasColumnName("owner_id");
            entity.Property(e => e.OwnerType)
                .HasMaxLength(20)
                .HasDefaultValue("Dealer")
                .HasColumnName("owner_type");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.ReceivedAt).HasColumnName("received_at");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("InStock")
                .HasColumnName("status");

            entity.HasOne(d => d.Branch).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.BranchId)
                .HasConstraintName("FK_inventory_branch");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.DealerId)
                .HasConstraintName("FK_inventory_dealer");

            entity.HasOne(d => d.Order).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_inventory_order");

            entity.HasOne(d => d.Product).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_inventory_product");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasKey(e => e.InvoiceId).HasName("PK__invoices__F58DFD498930B911");

            entity.ToTable("invoices");

            entity.HasIndex(e => new { e.DealerId, e.InvoiceType, e.Status }, "IX_invoices_dealer_type_status");

            entity.HasIndex(e => e.InvoiceNo, "UQ__invoices__F58CA1E205613487").IsUnique();

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
                .HasColumnName("invoice_type");
            entity.Property(e => e.IssuedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("issued_at");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.SalesDocId).HasColumnName("sales_doc_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending")
                .HasColumnName("status");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_invoices_dealer");

            entity.HasOne(d => d.Po).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.PoId)
                .HasConstraintName("FK_invoices_po");

            entity.HasOne(d => d.SalesDoc).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.SalesDocId)
                .HasConstraintName("FK_invoices_order");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__orders__465962291C253940");

            entity.ToTable("orders");

            entity.HasIndex(e => e.CustomerId, "IX_orders_customer");

            entity.HasIndex(e => e.DealerId, "IX_orders_dealer");

            entity.HasIndex(e => e.Status, "IX_orders_status");

            entity.Property(e => e.OrderId).HasColumnName("order_id");
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
            entity.Property(e => e.EtaDate).HasColumnName("eta_date");
            entity.Property(e => e.PricebookId).HasColumnName("pricebook_id");
            entity.Property(e => e.QuoteId).HasColumnName("quote_id");
            entity.Property(e => e.ReceiverName)
                .HasMaxLength(255)
                .HasColumnName("receiver_name");
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

            entity.HasOne(d => d.Customer).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_orders_customer");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Orders)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_orders_dealer");

            entity.HasOne(d => d.Pricebook).WithMany(p => p.Orders)
                .HasForeignKey(d => d.PricebookId)
                .HasConstraintName("FK_orders_pricebook");

            entity.HasOne(d => d.Quote).WithMany(p => p.Orders)
                .HasForeignKey(d => d.QuoteId)
                .HasConstraintName("FK_orders_quote");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.OrderItemId).HasName("PK__order_it__3764B6BC35D0CBFA");

            entity.ToTable("order_items");

            entity.HasIndex(e => e.OrderId, "IX_oi_order");

            entity.HasIndex(e => new { e.OrderId, e.ProductId }, "UQ_order_item").IsUnique();

            entity.Property(e => e.OrderItemId).HasColumnName("order_item_id");
            entity.Property(e => e.LinePromo)
                .HasComputedColumnSql("(isnull([oem_discount_applied],(0))*[qty])", true)
                .HasColumnType("decimal(29, 2)")
                .HasColumnName("line_promo");
            entity.Property(e => e.LineTotal)
                .HasComputedColumnSql("(([unit_price]-isnull([oem_discount_applied],(0)))*[qty])", true)
                .HasColumnType("decimal(30, 2)")
                .HasColumnName("line_total");
            entity.Property(e => e.OemDiscountApplied)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("oem_discount_applied");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Qty)
                .HasDefaultValue(1)
                .HasColumnName("qty");
            entity.Property(e => e.UnitPrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("unit_price");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK_oi_order");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_oi_product");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__payments__ED1FC9EA906B0985");

            entity.ToTable("payments");

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
                .HasMaxLength(20)
                .HasDefaultValue("Captured")
                .HasColumnName("status");

            entity.HasOne(d => d.Invoice).WithMany(p => p.Payments)
                .HasForeignKey(d => d.InvoiceId)
                .HasConstraintName("FK_payments_invoice");
        });

        modelBuilder.Entity<PoItem>(entity =>
        {
            entity.HasKey(e => e.PoItemId).HasName("PK__po_items__E2A5830549AFA53E");

            entity.ToTable("po_items");

            entity.HasIndex(e => e.PoId, "IX_poi_po");

            entity.HasIndex(e => new { e.PoId, e.ProductId }, "UQ_poi").IsUnique();

            entity.Property(e => e.PoItemId).HasColumnName("po_item_id");
            entity.Property(e => e.LineTotal)
                .HasComputedColumnSql("([unit_wholesale]*[qty])", true)
                .HasColumnType("decimal(29, 2)")
                .HasColumnName("line_total");
            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Qty).HasColumnName("qty");
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
            entity.HasKey(e => e.PricebookId).HasName("PK__priceboo__0DDE58F137235C8D");

            entity.ToTable("pricebooks");

            entity.HasIndex(e => e.DealerId, "IX_pricebooks_dealer");

            entity.HasIndex(e => new { e.DealerId, e.Name, e.EffectiveFrom }, "UQ_pricebooks").IsUnique();

            entity.Property(e => e.PricebookId).HasColumnName("pricebook_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.EffectiveFrom).HasColumnName("effective_from");
            entity.Property(e => e.EffectiveTo).HasColumnName("effective_to");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Active")
                .HasColumnName("status");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Pricebooks)
                .HasForeignKey(d => d.DealerId)
                .HasConstraintName("FK_pricebooks_dealer");
        });

        modelBuilder.Entity<PricebookItem>(entity =>
        {
            entity.HasKey(e => e.PricebookItemId).HasName("PK__priceboo__1062CA753B6CDD2B");

            entity.ToTable("pricebook_items");

            entity.HasIndex(e => e.PricebookId, "IX_pbi_pricebook");

            entity.HasIndex(e => e.ProductId, "IX_pbi_product");

            entity.HasIndex(e => new { e.PricebookId, e.ProductId }, "UQ_pbi").IsUnique();

            entity.Property(e => e.PricebookItemId).HasColumnName("pricebook_item_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.FloorPrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("floor_price");
            entity.Property(e => e.MsrpPrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("msrp_price");
            entity.Property(e => e.OemDiscountAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("oem_discount_amount");
            entity.Property(e => e.OemDiscountPercent)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("oem_discount_percent");
            entity.Property(e => e.PricebookId).HasColumnName("pricebook_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");

            entity.HasOne(d => d.Pricebook).WithMany(p => p.PricebookItems)
                .HasForeignKey(d => d.PricebookId)
                .HasConstraintName("FK_pbi_pricebook");

            entity.HasOne(d => d.Product).WithMany(p => p.PricebookItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_pbi_product");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__products__47027DF5DAC2E176");

            entity.ToTable("products");

            entity.HasIndex(e => new { e.ModelCode, e.VariantCode, e.ColorCode }, "UQ_products_sku").IsUnique();

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
            entity.Property(e => e.MotorKw)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("motor_kw");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.RangeKm).HasColumnName("range_km");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Active")
                .HasColumnName("status");
            entity.Property(e => e.VariantCode)
                .HasMaxLength(50)
                .HasColumnName("variant_code");
        });

        modelBuilder.Entity<PurchaseOrder>(entity =>
        {
            entity.HasKey(e => e.PoId).HasName("PK__purchase__368DA7F0641DB1B3");

            entity.ToTable("purchase_orders");

            entity.HasIndex(e => e.BranchId, "IX_po_branch");

            entity.HasIndex(e => e.DealerId, "IX_po_dealer");

            entity.Property(e => e.PoId).HasColumnName("po_id");
            entity.Property(e => e.ApprovedBy).HasColumnName("approved_by");
            entity.Property(e => e.BranchId).HasColumnName("branch_id");
            entity.Property(e => e.ConfirmedBy).HasColumnName("confirmed_by");
            entity.Property(e => e.CreateAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("create_at");
            entity.Property(e => e.CreateBy).HasColumnName("create_by");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.ExpectedDate).HasColumnName("expected_date");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Draft")
                .HasColumnName("status");
            entity.Property(e => e.SubmittedBy).HasColumnName("submitted_by");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.UpdateAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("update_at");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.PurchaseOrderApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK_po_approve");

            entity.HasOne(d => d.Branch).WithMany(p => p.PurchaseOrders)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_po_branch");

            entity.HasOne(d => d.ConfirmedByNavigation).WithMany(p => p.PurchaseOrderConfirmedByNavigations)
                .HasForeignKey(d => d.ConfirmedBy)
                .HasConstraintName("FK_po_confirm");

            entity.HasOne(d => d.CreateByNavigation).WithMany(p => p.PurchaseOrderCreateByNavigations)
                .HasForeignKey(d => d.CreateBy)
                .HasConstraintName("FK_po_create");

            entity.HasOne(d => d.Dealer).WithMany(p => p.PurchaseOrders)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_po_dealer");

            entity.HasOne(d => d.SubmittedByNavigation).WithMany(p => p.PurchaseOrderSubmittedByNavigations)
                .HasForeignKey(d => d.SubmittedBy)
                .HasConstraintName("FK_po_submit");
        });

        modelBuilder.Entity<Quote>(entity =>
        {
            entity.HasKey(e => e.QuoteId).HasName("PK__quotes__0D37DF0C1F0B151F");

            entity.ToTable("quotes");

            entity.HasIndex(e => e.CustomerId, "IX_quotes_customer");

            entity.HasIndex(e => e.DealerId, "IX_quotes_dealer");

            entity.HasIndex(e => new { e.Status, e.LockedUntil }, "IX_quotes_status");

            entity.Property(e => e.QuoteId).HasColumnName("quote_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.LockedUntil).HasColumnName("locked_until");
            entity.Property(e => e.PricebookId).HasColumnName("pricebook_id");
            entity.Property(e => e.PromotionAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("promotion_amount");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Draft")
                .HasColumnName("status");
            entity.Property(e => e.SubtotalAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("subtotal_amount");
            entity.Property(e => e.TotalAmount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("total_amount");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Quotes)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_quotes_user");

            entity.HasOne(d => d.Customer).WithMany(p => p.Quotes)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_quotes_customer");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Quotes)
                .HasForeignKey(d => d.DealerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_quotes_dealer");

            entity.HasOne(d => d.Pricebook).WithMany(p => p.Quotes)
                .HasForeignKey(d => d.PricebookId)
                .HasConstraintName("FK_quotes_pricebook");
        });

        modelBuilder.Entity<QuoteItem>(entity =>
        {
            entity.HasKey(e => e.QuoteItemId).HasName("PK__quote_it__265BEED4E41031CE");

            entity.ToTable("quote_items");

            entity.HasIndex(e => e.QuoteId, "IX_qi_quote");

            entity.HasIndex(e => new { e.QuoteId, e.ProductId }, "UQ_quote_item").IsUnique();

            entity.Property(e => e.QuoteItemId).HasColumnName("quote_item_id");
            entity.Property(e => e.LinePromo)
                .HasComputedColumnSql("(isnull([oem_discount_applied],(0))*[qty])", true)
                .HasColumnType("decimal(29, 2)")
                .HasColumnName("line_promo");
            entity.Property(e => e.LineTotal)
                .HasComputedColumnSql("(([unit_price]-isnull([oem_discount_applied],(0)))*[qty])", true)
                .HasColumnType("decimal(30, 2)")
                .HasColumnName("line_total");
            entity.Property(e => e.OemDiscountApplied)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("oem_discount_applied");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Qty)
                .HasDefaultValue(1)
                .HasColumnName("qty");
            entity.Property(e => e.QuoteId).HasColumnName("quote_id");
            entity.Property(e => e.UnitPrice)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("unit_price");

            entity.HasOne(d => d.Product).WithMany(p => p.QuoteItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_qi_product");

            entity.HasOne(d => d.Quote).WithMany(p => p.QuoteItems)
                .HasForeignKey(d => d.QuoteId)
                .HasConstraintName("FK_qi_quote");
        });

        modelBuilder.Entity<Settlement>(entity =>
        {
            entity.HasKey(e => e.SettlementId).HasName("PK__settleme__9BB6D70836CC98E1");

            entity.ToTable("settlements");

            entity.HasIndex(e => e.ClaimId, "IX_settlements_claim");

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
            entity.HasKey(e => e.TestDriveId).HasName("PK__test_dri__7AC61E3062D4635B");

            entity.ToTable("test_drives");

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
            entity.HasKey(e => e.UserId).HasName("PK__users__B9BE370F813FB46D");

            entity.ToTable("users");

            entity.HasIndex(e => e.BranchId, "IX_users_branch");

            entity.HasIndex(e => e.DealerId, "IX_users_dealer");

            entity.HasIndex(e => e.Email, "UQ__users__AB6E6164F1E90175").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.BranchId).HasColumnName("branch_id");
            entity.Property(e => e.CreateAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("create_at");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(255)
                .HasColumnName("full_name");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.Role)
                .HasMaxLength(100)
                .HasColumnName("role");
            entity.Property(e => e.Salting)
                .HasMaxLength(225)
                .HasColumnName("salting");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Active")
                .HasColumnName("status");
            entity.Property(e => e.UpdateAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("update_at");

            entity.HasOne(d => d.Branch).WithMany(p => p.Users)
                .HasForeignKey(d => d.BranchId)
                .HasConstraintName("FK_users_branch");

            entity.HasOne(d => d.Dealer).WithMany(p => p.Users)
                .HasForeignKey(d => d.DealerId)
                .HasConstraintName("FK_users_dealer");
        });

        modelBuilder.Entity<VInvoiceBalance>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("v_invoice_balance");

            entity.Property(e => e.Amount)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.DealerId).HasColumnName("dealer_id");
            entity.Property(e => e.DueAt).HasColumnName("due_at");
            entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
            entity.Property(e => e.InvoiceNo)
                .HasMaxLength(50)
                .HasColumnName("invoice_no");
            entity.Property(e => e.InvoiceType)
                .HasMaxLength(10)
                .HasColumnName("invoice_type");
            entity.Property(e => e.IssuedAt).HasColumnName("issued_at");
            entity.Property(e => e.OutstandingAmount)
                .HasColumnType("decimal(38, 2)")
                .HasColumnName("outstanding_amount");
            entity.Property(e => e.PaidAmount)
                .HasColumnType("decimal(38, 2)")
                .HasColumnName("paid_amount");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
