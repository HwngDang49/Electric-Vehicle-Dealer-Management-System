using FluentValidation;

namespace backend.Feartures.Pricebooks.AddItem
{
    public class AddItemValidator : AbstractValidator<AddItemRequest>
    {
        public AddItemValidator()
        {
            RuleFor(x => x.ProductId)
                .GreaterThan(0)
                .WithMessage("ProductId phải lớn hơn 0");

            RuleFor(x => x.MsrpPrice)
                .GreaterThan(0)
                .WithMessage("Giá MSRP phải lớn hơn 0")
                .LessThan(1000000000)
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

