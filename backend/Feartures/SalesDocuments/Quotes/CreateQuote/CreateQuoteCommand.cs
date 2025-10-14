using System.Text.Json.Serialization;
using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Quotes.CreateQuote;

public sealed class CreateQuoteCommand : IRequest<Result<long>> // Trả về ID của Quote
{
    [JsonIgnore]
    public long DealerId { get; set; }

    public long CustomerId { get; set; }
    public List<CreateQuoteItem> Items { get; set; } = new();
}

public sealed class CreateQuoteItem
{
    public long ProductId { get; set; }
    public int Qty { get; set; } = 1;
}