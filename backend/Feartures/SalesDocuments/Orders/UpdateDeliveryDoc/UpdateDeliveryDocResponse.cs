namespace backend.Feartures.SalesDocuments.Orders.UpdateDeliveryDoc
{
    public class UpdateDeliveryDocResponse
    {
        public long OrderId { get; set; }
        public string? DeliveryDocUrl { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Message { get; set; } = "Đã cập nhật tài liệu bàn giao xe thành công";
    }
}
