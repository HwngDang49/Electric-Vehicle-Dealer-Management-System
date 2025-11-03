namespace backend.Feartures.Invoices.GetRetailInvoiceById
{
    public class GetRetailInvoiceByIdResponse
    {
        public RetailInvoiceDto? Invoice { get; set; }
    }
    // Nếu backend.FEartures.Invoices.GetRetailInvoices.RetailInvoiceDto đã tồn tại có thể import, còn không thì placeholder dưới:
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
        public string CustomerAddress { get; set; } = string.Empty;
        public string OrderName { get; set; } = string.Empty;
        public string? VehicleColor { get; set; }
        public decimal? VehicleBatteryKwh { get; set; }
        public decimal? VehicleMotorKw { get; set; }
        public int? VehicleRangeKm { get; set; }
        public string? Vin { get; set; }
        public decimal Amount { get; set; }
        public decimal OutstandingAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; }
        public DateTime? DueAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public string Currency { get; set; } = "VND";

    }
}

