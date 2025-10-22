namespace backend.Domain.Enums
{
    public enum PaymentStatus
    {
        Pending,    // Dealer đã tạo payment, chờ Manufacturer xác nhận
        Captured,   // Manufacturer xác nhận đã nhận tiền
    }
}
