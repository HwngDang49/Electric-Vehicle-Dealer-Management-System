using FluentValidation;

namespace backend.Feartures.SalesDocuments.Orders.CreateOrder
{
    public sealed class CreateOrderValidator : AbstractValidator<CreateOrderCommand>
    {
        public CreateOrderValidator()
        {
            RuleFor(x => x.CustomerId).GreaterThan(0).WithMessage("Customer is required.");
            RuleFor(x => x.ProductId).GreaterThan(0).WithMessage("Product is required.");
            RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Quantity must be at least 1.");
        }
    }
}
