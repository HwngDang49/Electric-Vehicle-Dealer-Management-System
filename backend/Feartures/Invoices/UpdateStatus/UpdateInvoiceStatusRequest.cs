namespace backend.Feartures.Invoices.UpdateStatus
{
    public class UpdateInvoiceStatusRequest
    {
        public long InvoiceId { get; set; }
        public string Status { get; set; } = null!; // "Processing", "Paid", etc.
    }
}

