using backend.Domain.Enums;
using backend.Infrastructure.Data;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.Create
{
    // Validate CreatePoCommand 
    public class CreatePoValidator : AbstractValidator<CreatePoCommand>
    {
        private readonly EVDmsDbContext _db;

        public CreatePoValidator(EVDmsDbContext db)
        {
            _db = db;

            // check BranchCode
            RuleFor(x => x.Request.BranchCode)
                .NotEmpty()
                .WithMessage("Mã chi nhánh là bắt buộc. Vui lòng chọn chi nhánh.")
                .MaximumLength(50)
                .WithMessage("Mã chi nhánh không được vượt quá 50 ký tự");

            //  check PoItems không null/empty
            RuleFor(x => x.Request.PoItems)
                .NotNull()
                .WithMessage("Danh sách sản phẩm không được để trống")
                .NotEmpty()
                .WithMessage("Vui lòng chọn ít nhất 1 sản phẩm để tạo đơn hàng")
                .Must(items => items != null && items.Count <= 100)
                .WithMessage("Mỗi đơn hàng không được vượt quá 100 sản phẩm");

            // không có duplicate ProductId
            RuleFor(x => x.Request.PoItems)
                .Must(HaveUniqueProductIds)
                .When(x => x.Request.PoItems != null && x.Request.PoItems.Any())
                .WithMessage("Không được chọn trùng sản phẩm trong cùng một đơn hàng. Vui lòng tăng số lượng thay vì thêm sản phẩm trùng lặp.");

            // check từng PoItem
            RuleForEach(x => x.Request.PoItems)
                .SetValidator(new CreatePoItemValidator(_db))
                .When(x => x.Request.PoItems != null && x.Request.PoItems.Any());
        }

        /// <summary>
        /// Kiểm tra không có ProductId trùng lặp trong danh sách
        /// </summary>
        private bool HaveUniqueProductIds(List<CreatePoItem> items)
        {
            if (items == null || !items.Any())
                return true;

            var productIds = items.Select(i => i.ProductId).ToList();
            return productIds.Count == productIds.Distinct().Count();
        }
    }

    /// <summary>
    /// Validator cho từng item trong PO
    /// </summary>
    public class CreatePoItemValidator : AbstractValidator<CreatePoItem>
    {
        private readonly EVDmsDbContext _db;

        public CreatePoItemValidator(EVDmsDbContext db)
        {
            _db = db;

            // ProductId phải > 0
            RuleFor(x => x.ProductId)
                .GreaterThan(0)
                .WithMessage("Product ID must be greater than 0");

            // Product phải tồn tại trong database
            RuleFor(x => x.ProductId)
                .MustAsync(async (productId, ct) =>
                {
                    return await _db.Products
                        .AnyAsync(p => p.ProductId == productId, ct);
                })
                .WithMessage("Product does not exist");

            // Product phải có status Active
            RuleFor(x => x.ProductId)
                .MustAsync(async (productId, ct) =>
                {
                    var product = await _db.Products
                        .AsNoTracking()
                        .FirstOrDefaultAsync(p => p.ProductId == productId, ct);

                    return product != null && product.Status == ProductStatus.Active.ToString();
                })
                .WithMessage("Product is not active")
                .When(x => x.ProductId > 0);

            // Product phải có giá trong Pricebook active
            // không filter theo dealer, logic filter sẽ được xử lý trong Handler
            RuleFor(x => x.ProductId)
                .MustAsync(async (productId, ct) =>
                {
                    var now = DateOnly.FromDateTime(DateTime.UtcNow);

                    var hasValidPrice = await _db.PricebookItems
                        .AsNoTracking()
                        .Include(pbi => pbi.Pricebook)
                        .AnyAsync(pbi =>
                            pbi.ProductId == productId
                            && pbi.Pricebook.Status == PricebookStatus.Active.ToString()
                            && pbi.Pricebook.EffectiveFrom <= now
                            && (pbi.Pricebook.EffectiveTo == null || pbi.Pricebook.EffectiveTo >= now)
                            && pbi.FloorPrice > 0,
                            ct);

                    return hasValidPrice;
                })
                .WithMessage("Product does not match price in pricebook")
                .When(x => x.ProductId > 0);

            // Quantity phải > 0
            RuleFor(x => x.Qty)
                .GreaterThan(0)
                .WithMessage("Quantity must be greater than 0");

        }
    }
}
