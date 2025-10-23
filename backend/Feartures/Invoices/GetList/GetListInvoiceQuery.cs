using backend.Domain.Enums;

namespace backend.Feartures.Invoices.GetList
{
    public class GetListInvoiceQuery
    {
        public long InvoiceId { get; set; }
        public InvoiceType Type { get; set; }
        public long DealerId { get; set; }
        public long? SaleDocId { get; set; }
        public long? PoId { get; set; }
        public string InvoiceNo { get; set; } = string.Empty;
        public string Currency { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public InvoiceStatus Status { get; set; }
        public DateTime IssuedAt { get; set; }
        public DateTime DueAt { get; set; }
        public string? Note { get; set; }
    }
}
