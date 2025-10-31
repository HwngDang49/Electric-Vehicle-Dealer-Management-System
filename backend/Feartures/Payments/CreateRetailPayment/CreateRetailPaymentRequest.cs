namespace backend.Feartures.Payments.CreateRetailPayment
{
    public class CreateRetailPaymentRequest
    {
        public long InvoiceId { get; set; }
        public decimal Amount { get; set; }
    }
}

