using FluentValidation;

namespace backend.Feartures.Products.Create
{
    public sealed class CreateProductValidator : AbstractValidator<CreateProductRequest>
    {
        public CreateProductValidator()
        {
            RuleFor(x => x.ModelCode)
                .NotEmpty()
                .WithMessage("Model code is required.");

            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Product name is required.");

            RuleFor(x => x.VariantCode)
                .NotEmpty()
                .WithMessage("Variant code is required.");

            RuleFor(x => x.BatteryKwh)
                .GreaterThan(0)
                .When(x => x.BatteryKwh.HasValue)
                .WithMessage("Battery KWh must be greater than 0.");

            RuleFor(x => x.MotorKw)
                .GreaterThan(0)
                .When(x => x.MotorKw.HasValue)
                .WithMessage("Motor KW must be greater than 0.");

            RuleFor(x => x.RangeKm)
                .GreaterThan(0)
                .When(x => x.RangeKm.HasValue)
                .WithMessage("Range KM must be greater than 0.");
        }
    }
}
