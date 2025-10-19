using FluentValidation;
using backend.Domain.Enums;

namespace backend.Feartures.Pricebooks.Create
{
    public class CreatePricebookValidator : AbstractValidator<CreatePricebookRequest>
    {
        public CreatePricebookValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Tên bảng giá không được để trống")
                .MaximumLength(255)
                .WithMessage("Tên bảng giá không được vượt quá 255 ký tự");

            RuleFor(x => x.Status)
                .IsInEnum()
                .WithMessage("Trạng thái không hợp lệ");

            RuleFor(x => x.PricebookItems)
                .NotEmpty()
                .WithMessage("Bảng giá phải có ít nhất một sản phẩm")
                .Must(items => items.Count > 0)
                .WithMessage("Bảng giá phải có ít nhất một sản phẩm");

            RuleForEach(x => x.PricebookItems)
                .SetValidator(new PricebookItemValidator());
        }
    }

    public class PricebookItemValidator : AbstractValidator<PricebookItemUpsertDto>
    {
        public PricebookItemValidator()
        {
            RuleFor(x => x.ProductId)
                .GreaterThan(0)
                .WithMessage("ProductId phải lớn hơn 0");

            RuleFor(x => x.MsrpPrice)
                .GreaterThan(0)
                .WithMessage("Giá MSRP phải lớn hơn 0")
                .LessThan(1000000000) // 1 tỷ VND
                .WithMessage("Giá MSRP không được vượt quá 1 tỷ VND");

            RuleFor(x => x.FloorPrice)
                .GreaterThan(0)
                .When(x => x.FloorPrice.HasValue)
                .WithMessage("Giá sàn phải lớn hơn 0")
                .LessThan(1000000000)
                .When(x => x.FloorPrice.HasValue)
                .WithMessage("Giá sàn không được vượt quá 1 tỷ VND")
                .LessThanOrEqualTo(x => x.MsrpPrice)
                .When(x => x.FloorPrice.HasValue)
                .WithMessage("Giá sàn không được lớn hơn giá MSRP");

            RuleFor(x => x.OemDiscountAmount)
                .GreaterThanOrEqualTo(0)
                .When(x => x.OemDiscountAmount.HasValue)
                .WithMessage("Số tiền giảm giá OEM phải lớn hơn hoặc bằng 0")
                .LessThan(x => x.MsrpPrice)
                .When(x => x.OemDiscountAmount.HasValue)
                .WithMessage("Số tiền giảm giá OEM không được lớn hơn giá MSRP");

            RuleFor(x => x.OemDiscountPercent)
                .GreaterThanOrEqualTo(0)
                .When(x => x.OemDiscountPercent.HasValue)
                .WithMessage("Phần trăm giảm giá OEM phải lớn hơn hoặc bằng 0")
                .LessThanOrEqualTo(100)
                .When(x => x.OemDiscountPercent.HasValue)
                .WithMessage("Phần trăm giảm giá OEM không được vượt quá 100%");

            // Business rule: Không được có cả discount amount và percent
            RuleFor(x => x)
                .Must(x => !(x.OemDiscountAmount.HasValue && x.OemDiscountPercent.HasValue))
                .WithMessage("Không được áp dụng cả số tiền giảm giá và phần trăm giảm giá cùng lúc");
        }
    }
}
