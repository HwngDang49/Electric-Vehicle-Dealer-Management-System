namespace backend.Feartures.Invoices.GetRetailInvoices
{
    public class GetRetailInvoicesResponse
    {
        public List<RetailInvoiceDto> Data { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class RetailInvoiceDto
    {
        public long InvoiceId { get; set; }
        public string InvoiceNo { get; set; } = string.Empty;
        public long SalesDocId { get; set; }
        public long DealerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerIdNumber { get; set; } = string.Empty;
        public string OrderName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal OutstandingAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; }
        public DateTime? DueAt { get; set; }
        public string Currency { get; set; } = "VND";
    }
}
