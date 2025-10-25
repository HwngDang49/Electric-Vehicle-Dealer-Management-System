namespace backend.Feartures.Payments.ConfirmPayment
{
    public class ConfirmPaymentRequest
    {
        public long InvoiceId { get; set; }
        public string Status { get; set; } = "Paid"; // Default to Paid for payment confirmation
    }
}

