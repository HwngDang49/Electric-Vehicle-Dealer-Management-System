namespace backend.Feartures.Invoices.GetRetailInvoices
{
    public class GetRetailInvoicesRequest
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Search { get; set; }
        public string? Status { get; set; }
        public long? DealerId { get; set; }
    }
}
