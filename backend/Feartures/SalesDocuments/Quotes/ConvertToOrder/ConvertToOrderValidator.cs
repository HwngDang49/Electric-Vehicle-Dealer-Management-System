using FluentValidation;

namespace backend.Feartures.SalesDocuments.Quotes.ConvertToOrder;

public sealed class ConvertToOrderValidator : AbstractValidator<ConvertToOrderCommand>
{
    public ConvertToOrderValidator()
    {
        RuleFor(x => x.SalesDocId).GreaterThan(0);
        RuleFor(x => x.DealerId).GreaterThan(0);
    }
}
