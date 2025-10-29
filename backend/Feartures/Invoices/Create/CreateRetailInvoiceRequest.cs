namespace backend.Feartures.Invoices.Create
{
    public class CreateRetailInvoiceRequest
    {
        public long OrderId { get; set; }
        public long DealerId { get; set; }
        public string Note { get; set; } = "";
    }
}
