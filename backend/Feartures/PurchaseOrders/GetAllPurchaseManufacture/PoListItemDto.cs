namespace backend.Feartures.PurchaseOrders.GetAllPurchase
{
    public class PoListItemDto
    {
        public long PoId { get; set; }
        public long DealerId { get; set; }
        public long BranchId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? ExpectedDate { get; set; }
        public decimal? TotalAmount { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }
        public long? CreateBy { get; set; }
        public long? SubmittedBy { get; set; }
        public long? ApprovedBy { get; set; }
        public long? ConfirmedBy { get; set; }
        public int ItemCount { get; set; }
        public int TotalQuantity { get; set; }
        public List<PoItemDto> Items { get; set; } = new List<PoItemDto>();
    }

    public class PoItemDto
    {
        public long PoItemId { get; set; }
        public long ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
    }
}
