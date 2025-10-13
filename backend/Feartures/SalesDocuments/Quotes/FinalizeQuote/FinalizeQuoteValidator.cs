using FluentValidation;

namespace backend.Feartures.SalesDocuments.Quotes.FinalizeQuote;

public sealed class FinalizeQuoteValidator : AbstractValidator<FinalizeQuoteCommand>
{
    public FinalizeQuoteValidator()
    {
        RuleFor(x => x.SalesDocId).GreaterThan(0);
        RuleFor(x => x.DealerId).GreaterThan(0);
    }
}
