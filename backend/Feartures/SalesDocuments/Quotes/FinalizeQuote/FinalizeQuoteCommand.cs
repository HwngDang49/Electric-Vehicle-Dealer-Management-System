using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Quotes.FinalizeQuote;

public sealed class FinalizeQuoteCommand : IRequest<Result<bool>>
{
    public long QuoteId { get; set; } 
}