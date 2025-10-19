namespace backend.Feartures.SalesDocuments.Orders.CompleteDelivery
{
    public class CompleteDeliveryRequest
    {
        public long OrderId { get; set; }
        public string? DeliveryDocUrl { get; set; }
        public string? Notes { get; set; }
        public DateTime? ActualDeliveryTime { get; set; } // Thời gian giao hàng thực tế
    }
}
