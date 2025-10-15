using FluentValidation;

namespace backend.Feartures.SalesDocuments.Quotes.CreateQuote
{
    //sealed : không thể kế thừa
    public sealed class CreateQuoteValidator : AbstractValidator<CreateQuoteCommand>
    {
        public CreateQuoteValidator()
        {
            // DealerId được set trong controller từ JWT
            RuleFor(x => x.CustomerId).GreaterThan(0);
            RuleFor(x => x.DealerId).GreaterThan(0);

            RuleFor(x => x.Items)
                .NotNull().WithMessage("Items is required.")
                .Must(items => items != null && items.Count == 1)
                .WithMessage("A Quote must contain exactly 1 item.");

            RuleForEach(x => x.Items).ChildRules(item =>
            {
                item.RuleFor(i => i.ProductId).GreaterThan(0);
                item.RuleFor(i => i.Qty).Equal(1)
                    .WithMessage("Quote item quantity must be 1.");
            });
        }
    }
}
