using System.Text.Json.Serialization;
using Ardalis.Result;
using MediatR;
namespace backend.Feartures.SalesDocuments.CreateQuote
{
    public sealed class CreateQuoteCommand : IRequest<Result<long>>
    {
        [JsonIgnore]                         // DealerId chỉ lấy từ JWT, không bind từ body
        public long DealerId { get; set; }

        public long CustomerId { get; set; }
        public long? PricebookId { get; set; }   // optional
        public string? Notes { get; set; }
        public List<CreateQuoteItem> Items { get; set; } = new();
    }

    public sealed class CreateQuoteItem
    {
        public long ProductId { get; set; }
        public int Qty { get; set; } = 1;
        public decimal UnitPrice { get; set; } = 0m;
        public decimal LineDiscount { get; set; } = 0m;
        public decimal LinePromo { get; set; } = 0m;
    }
}
