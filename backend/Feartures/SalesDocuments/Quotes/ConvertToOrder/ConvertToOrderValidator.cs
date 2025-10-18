using FluentValidation;

namespace backend.Feartures.SalesDocuments.Quotes.ConvertToOrder;

public sealed class ConvertToOrderValidator : AbstractValidator<ConvertToOrderCommand>
{
    public ConvertToOrderValidator()
    {
            RuleFor(x => x.QuoteId).GreaterThan(0);
    }
}
