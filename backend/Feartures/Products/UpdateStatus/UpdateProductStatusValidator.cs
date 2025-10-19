using FluentValidation;

namespace backend.Feartures.Products.UpdateStatus
{
    public sealed class UpdateProductStatusValidator : AbstractValidator<UpdateProductStatusCommand>
    {
        public UpdateProductStatusValidator()
        {
            RuleFor(x => x.ProductId)
                .GreaterThan(0)
                .WithMessage("Product ID is required.");
        }
    }
}
