using MediatR;

namespace backend.Feartures.SalesDocuments.Quotes.GetQuoteDetails
{
    public sealed class GetQuoteByIdQuery : IRequest<GetQuoteDetailDto>
    {
        public long QuoteId { get; set; }
    }

    public sealed class GetQuoteDetailDto
    {
        public long QuoteId { get; set; }
        public long DealerId { get; set; }
        public long CustomerId { get; set; }
        public string CustomerName { get; set; } = default!;
        public string? CustomerPhone { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerAddress { get; set; }
        public string? CustomerIdNumber { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Notes { get; set; }

        // NEW
        public DateTime? LockedUntil { get; set; }
        public bool IsExpired { get; set; }

        public List<GetQuoteItemDto> Items { get; set; } = new();
    }

    public sealed class GetQuoteItemDto
    {
        public long SdiId { get; set; }
        public long ProductId { get; set; }
        public string ProductName { get; set; } = default!;
        public string? ModelCode { get; set; }
        public string? VariantCode { get; set; }
        public string? ColorName { get; set; }
        public string? ColorCode { get; set; }
        public int Qty { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LinePromo { get; set; }
        public decimal LineTotal { get; set; }
        
        // Vehicle specs
        public decimal? BatteryKwh { get; set; }
        public decimal? MotorKw { get; set; }
        public decimal? RangeKm { get; set; }
    }
}
