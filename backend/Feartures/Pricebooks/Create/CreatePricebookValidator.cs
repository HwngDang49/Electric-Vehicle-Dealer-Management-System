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

            // ✅ Validation cho EffectiveFrom
            RuleFor(x => x.EffectiveFrom)
                .NotEmpty()
                .WithMessage("Ngày bắt đầu không được để trống");

            // ✅ Validation cho EffectiveTo (nếu có, phải >= EffectiveFrom)
            RuleFor(x => x.EffectiveTo)
                .GreaterThan(x => x.EffectiveFrom)
                .When(x => x.EffectiveTo.HasValue)
                .WithMessage("Ngày kết thúc phải lớn hơn ngày bắt đầu");

            // ✅ Validation cho DealerId (nếu có, phải > 0)
            RuleFor(x => x.DealerId)
                .GreaterThan(0)
                .When(x => x.DealerId.HasValue)
                .WithMessage("DealerId phải lớn hơn 0");

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
                .WithMessage("Giá sàn phải lớn hơn 0")
                .LessThan(1000000000)
                .WithMessage("Giá sàn không được vượt quá 1 tỷ VND")
                .LessThanOrEqualTo(x => x.MsrpPrice)
                .WithMessage("Giá sàn không được lớn hơn giá MSRP");
        }
    }
}
