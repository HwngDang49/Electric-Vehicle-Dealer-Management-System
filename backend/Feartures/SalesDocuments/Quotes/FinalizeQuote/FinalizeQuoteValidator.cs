﻿using FluentValidation;

namespace backend.Feartures.SalesDocuments.Quotes.FinalizeQuote;

public sealed class FinalizeQuoteValidator : AbstractValidator<FinalizeQuoteCommand>
{
    public FinalizeQuoteValidator()
    {
            RuleFor(x => x.QuoteId).GreaterThan(0);
    }
}
