using FluentValidation;

namespace backend.Feartures.Products.Update
{
    public sealed class UpdateProductValidator : AbstractValidator<UpdateProductCommand>
    {
        public UpdateProductValidator()
        {
            RuleFor(x => x.ProductId)
                .GreaterThan(0)
                .WithMessage("Product ID must be greater than 0");

            RuleFor(x => x.Request.ModelCode)
                .NotEmpty()
                .WithMessage("Model code is required")
                .MaximumLength(50)
                .WithMessage("Model code cannot exceed 50 characters");

            RuleFor(x => x.Request.Name)
                .NotEmpty()
                .WithMessage("Product name is required")
                .MaximumLength(200)
                .WithMessage("Product name cannot exceed 200 characters");

            RuleFor(x => x.Request.VariantCode)
                .NotEmpty()
                .WithMessage("Variant code is required")
                .MaximumLength(50)
                .WithMessage("Variant code cannot exceed 50 characters");

            RuleFor(x => x.Request.ColorCode)
                .MaximumLength(20)
                .WithMessage("Color code cannot exceed 20 characters");

            RuleFor(x => x.Request.ColorName)
                .MaximumLength(50)
                .WithMessage("Color name cannot exceed 50 characters");

            RuleFor(x => x.Request.BatteryKwh)
                .GreaterThan(0)
                .When(x => x.Request.BatteryKwh.HasValue)
                .WithMessage("Battery capacity must be greater than 0");

            RuleFor(x => x.Request.MotorKw)
                .GreaterThan(0)
                .When(x => x.Request.MotorKw.HasValue)
                .WithMessage("Motor power must be greater than 0");

            RuleFor(x => x.Request.RangeKm)
                .GreaterThan(0)
                .When(x => x.Request.RangeKm.HasValue)
                .WithMessage("Range must be greater than 0");
        }
    }
}