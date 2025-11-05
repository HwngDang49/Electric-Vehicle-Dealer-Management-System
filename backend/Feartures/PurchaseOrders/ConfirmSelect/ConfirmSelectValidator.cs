using FluentValidation;

namespace backend.Feartures.PurchaseOrders.ConfirmSelect
{
    /// <summary>
    /// Validator cho ConfirmSelectCommand - Validate gán VIN thủ công cho PO
    /// </summary>
    public class ConfirmSelectValidator : AbstractValidator<ConfirmSelectCommand>
    {
        public ConfirmSelectValidator()
        {
            // PoId phải > 0
            RuleFor(x => x.Request.PoId)
                .GreaterThan(0)
                .WithMessage("PO ID phải lớn hơn 0");

            // VinAllocations không được null
            RuleFor(x => x.Request.VinAllocations)
                .NotNull()
                .WithMessage("Danh sách phân bổ VIN không được để trống");

            // VinAllocations không được empty
            RuleFor(x => x.Request.VinAllocations)
                .NotEmpty()
                .WithMessage("PO phải có ít nhất 1 phân bổ VIN cho sản phẩm")
                .When(x => x.Request.VinAllocations != null);

            // Không có ProductId trùng lặp trong VinAllocations
            RuleFor(x => x.Request.VinAllocations)
                .Must(HaveUniqueProductIds)
                .WithMessage("Không được có ProductId trùng lặp trong danh sách phân bổ VIN")
                .When(x => x.Request.VinAllocations != null && x.Request.VinAllocations.Any());

            // Validate từng VinAllocationItem
            RuleForEach(x => x.Request.VinAllocations)
                .SetValidator(new VinAllocationItemValidator())
                .When(x => x.Request.VinAllocations != null && x.Request.VinAllocations.Any());
        }

        /// <summary>
        /// Kiểm tra không có ProductId trùng lặp trong VinAllocations
        /// </summary>
        private bool HaveUniqueProductIds(List<VinAllocationItem> allocations)
        {
            if (allocations == null || !allocations.Any())
                return true;

            var productIds = allocations.Select(a => a.ProductId).ToList();
            return productIds.Count == productIds.Distinct().Count();
        }
    }

    /// <summary>
    /// Validator cho từng VinAllocationItem
    /// </summary>
    public class VinAllocationItemValidator : AbstractValidator<VinAllocationItem>
    {
        public VinAllocationItemValidator()
        {
            // ProductId phải > 0
            RuleFor(x => x.ProductId)
                .GreaterThan(0)
                .WithMessage("Product ID phải lớn hơn 0");

            // SelectedVins không được null
            RuleFor(x => x.SelectedVins)
                .NotNull()
                .WithMessage("Danh sách VIN đã chọn không được để trống");

            // SelectedVins không được empty
            RuleFor(x => x.SelectedVins)
                .NotEmpty()
                .WithMessage("Phải chọn ít nhất 1 VIN cho sản phẩm")
                .When(x => x.SelectedVins != null);

            // Mỗi VIN không được rỗng hoặc chỉ có khoảng trắng
            RuleForEach(x => x.SelectedVins)
                .NotEmpty()
                .WithMessage("VIN không được để trống")
                .When(x => x.SelectedVins != null);

            RuleForEach(x => x.SelectedVins)
                .Must(vin => !string.IsNullOrWhiteSpace(vin))
                .WithMessage("VIN không được chỉ chứa khoảng trắng")
                .When(x => x.SelectedVins != null);

            // Không có VIN trùng lặp trong cùng một product
            RuleFor(x => x.SelectedVins)
                .Must(HaveNoDuplicateVins)
                .WithMessage("Không được chọn VIN trùng lặp trong cùng một sản phẩm")
                .When(x => x.SelectedVins != null && x.SelectedVins.Any());

            // VIN phải có độ dài hợp lệ (thường VIN có 17 ký tự)
            RuleForEach(x => x.SelectedVins)
                .Length(17, 17)
                .WithMessage("VIN phải có đúng 17 ký tự")
                .When(x => x.SelectedVins != null);

            // VIN chỉ chứa chữ và số (không có ký tự đặc biệt)
            RuleForEach(x => x.SelectedVins)
                .Matches(@"^[A-Z0-9]+$")
                .WithMessage("VIN chỉ được chứa chữ cái in hoa và số (A-Z, 0-9)")
                .When(x => x.SelectedVins != null);
        }

        /// <summary>
        /// Kiểm tra không có VIN trùng lặp trong cùng một product
        /// </summary>
        private bool HaveNoDuplicateVins(List<string> vins)
        {
            if (vins == null || !vins.Any())
                return true;

            // So sánh case-insensitive để tránh trùng VIN với chữ hoa/thường khác nhau
            var normalizedVins = vins.Select(v => v?.Trim().ToUpperInvariant()).ToList();
            return normalizedVins.Count == normalizedVins.Distinct().Count();
        }
    }
}

