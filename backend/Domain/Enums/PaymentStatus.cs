namespace backend.Domain.Enums
{
    public enum PaymentStatus
    {
        Pending,     // Dealer đã tạo payment, chờ xử lý
        Processing,  // Đang xử lý thanh toán
        Captured,    // Manufacturer xác nhận đã nhận tiền
        Failed,      // Thanh toán thất bại
    }
}
