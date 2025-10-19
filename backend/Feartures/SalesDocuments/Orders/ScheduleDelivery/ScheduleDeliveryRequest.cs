using System.ComponentModel.DataAnnotations;

namespace backend.Feartures.SalesDocuments.Orders.ScheduleDelivery
{
    public class ScheduleDeliveryRequest
    {
        public long OrderId { get; set; }

        public DateTime DeliveryDate { get; set; }
        public string DeliveryTimeSlot { get; set; } = string.Empty; // "Morning", "Afternoon", "Evening"
        public string DeliveryAddress { get; set; } = string.Empty;
        public string? ContactPhone { get; set; }
        public string? ContactName { get; set; }
        public string? Notes { get; set; }
    }
}
