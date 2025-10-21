namespace backend.Feartures.Payments.Create
{
    public class CreatePaymentRequest
    {
        public long InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public string? Method { get; set; }
        public string? ReferenceNo { get; set; }
        public string? Note { get; set; }
    }
}

