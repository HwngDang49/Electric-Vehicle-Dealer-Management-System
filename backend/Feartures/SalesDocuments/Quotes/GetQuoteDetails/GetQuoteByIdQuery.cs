using System.Text.Json.Serialization;
using MediatR;

namespace backend.Feartures.SalesDocuments.Quotes.GetQuoteDetails
{
    public sealed class GetQuoteByIdQuery : IRequest<GetQuoteDetailDto>
    {
        [JsonIgnore] public long DealerId { get; set; }   // lấy từ JWT
        public long SalesDocId { get; set; }
    }

    public sealed class GetQuoteDetailDto
    {
        public long SalesDocId { get; set; }
        public long DealerId { get; set; }
        public long CustomerId { get; set; }
        public string CustomerName { get; set; } = default!;
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Notes { get; set; }

        public List<GetQuoteItemDto> Items { get; set; } = new();
    }

    public sealed class GetQuoteItemDto
    {
        public long SdiId { get; set; }
        public long ProductId { get; set; }
        public string ProductName { get; set; } = default!;
        public int Qty { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineDiscount { get; set; }
        public decimal LinePromo { get; set; }
        public decimal LineTotal { get; set; }   // computed column từ DB
    }
}
