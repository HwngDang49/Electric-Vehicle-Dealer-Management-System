namespace backend.Feartures.SalesDocuments.Orders.ScheduleDelivery
{
    public class ScheduleDeliveryResponse
    {
        public long OrderId { get; set; }
        public DateTime DeliveryDate { get; set; }
        public string DeliveryTimeSlot { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;
        public string? ContactPhone { get; set; }
        public string? ContactName { get; set; }
        public string? Notes { get; set; }
        public DateTime ScheduledAt { get; set; }
        public string Status { get; set; } = "Ready";
    }
}
