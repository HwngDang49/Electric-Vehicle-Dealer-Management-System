using FluentValidation;

namespace backend.Feartures.SalesDocuments.Quotes.CancelQuote
{
    public sealed class CancelQuoteValidator : AbstractValidator<CancelQuoteCommand>
    {
        public CancelQuoteValidator()
        {
            RuleFor(x => x.DealerId).GreaterThan(0);
            RuleFor(x => x.SalesDocId).GreaterThan(0);
        }
    }
}
