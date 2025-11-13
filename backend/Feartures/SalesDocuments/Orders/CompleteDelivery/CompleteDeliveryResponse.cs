namespace backend.Feartures.SalesDocuments.Orders.CompleteDelivery
{
    public class CompleteDeliveryResponse
    {
        public long OrderId { get; set; }
        public string Status { get; set; } = "Delivered";
        public DateTime DeliveredAt { get; set; }
        public string? Notes { get; set; }
        public DateTime CompletedAt { get; set; }
        public string Message { get; set; } = "Đơn hàng đã được bàn giao thành công";
    }
}
