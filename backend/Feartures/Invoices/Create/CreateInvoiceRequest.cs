using backend.Domain.Enums;

namespace backend.Feartures.Invoices.Create
{
    public class CreateInvoiceRequest
    {
        public InvoiceType Type { get; set; }
        public long DealerId { get; set; }
        public long SaleDocId { get; set; }
        public long PoId { get; set; }
        //public string Currency { get; set; }
        public string Note { get; set; }
        //public List<CreatePaymentRequest> Payments { get; set; }

    }

    //public class CreatePaymentRequest
    //{
    //    //public decimal Amount { get; set; }
    //    public string Method { get; set; }
    //    public PaymentStatus Status { get; set; } = PaymentStatus.Captured;
    //    public DateTime? PaidAtUtc { get; set; }
    //    public string ReferenceNo { get; set; }
    //    public string? Note { get; set; }
    //}
}
