namespace backend.Domain.Enums
{
    public enum InventoryStatus
    {
        InStock,        // Có sẵn trong kho
        Allocated,      // Đã phân bổ cho đơn hàng
        Reserved,       // Đã đặt chỗ (tạm thời)
        InTransit,      // Đang vận chuyển
        Delivered,      // Đã giao hàng
    }
}
