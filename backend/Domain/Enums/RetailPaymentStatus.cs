namespace backend.Domain.Enums
{
    public enum RetailPaymentStatus
    {
        Pending,    // Khởi tạo giao dịch
        Captured,   // Thu tiền thành công
        Failed      // Lỗi/không thành công
    }
}
