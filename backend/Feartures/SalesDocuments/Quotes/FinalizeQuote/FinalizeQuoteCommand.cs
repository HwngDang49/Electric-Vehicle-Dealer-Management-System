using System.Text.Json.Serialization;
using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Quotes.FinalizeQuote;

public sealed class FinalizeQuoteCommand : IRequest<Result<bool>>
{
    [JsonIgnore] public long DealerId { get; set; }   // lấy từ JWT
    public long SalesDocId { get; set; }              // chỉ cần id
}
