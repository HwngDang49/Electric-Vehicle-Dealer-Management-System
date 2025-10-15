using backend.Domain.Enums;

namespace backend.Feartures.Invoices.GetList
{
    public class GetListInvoiceQuery
    {
        public long InvoiceId { get; set; }
        public InvoiceType Type { get; set; }
        public long DealerId { get; set; }
        public long SaleDocId { get; set; }
        public long PoId { get; set; }
        public long InvoiceNo { get; set; }
        public string Currency { get; set; }
        public decimal Amount { get; set; }
        InvoiceStatus Status { get; set; }
        public DateTime IssuedAt { get; set; }
        public DateTime DueAt { get; set; }
        public string Note { get; set; }
    }
}
