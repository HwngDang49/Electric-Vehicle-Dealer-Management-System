using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Quotes.FinalizeQuote;

public sealed class FinalizeQuoteCommand : IRequest<Result<bool>>
{
    public long SalesDocId { get; set; } // Chỉ cần ID từ route
}