using System.Text.Json.Serialization;
using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Quotes.CancelQuote
{
    public sealed class CancelQuoteCommand : IRequest<Result>
    {
        [JsonIgnore]
        public long SalesDocId { get; set; } // Lấy từ route URL

        [JsonIgnore]
        public long DealerId { get; set; } // Lấy từ JWT Token

    }
}
