using MediatR;

namespace backend.Feartures.Inventories.GetManufacturerInventory
{
    public class GetManufacturerInventoryQuery : IRequest<List<ManufacturerInventoryDto>>
    {
        public string? SearchTerm { get; set; } // Tìm theo tên sản phẩm
        public long? ProductId { get; set; } // Filter theo sản phẩm
        public string? Status { get; set; } // Filter theo trạng thái
    }

    public class ManufacturerInventoryDto
    {
        public long ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public ManufacturerQuantityInfo QuantityInfo { get; set; } = new();
        public DateTime LastUpdated { get; set; }
    }

    public class ManufacturerQuantityInfo
    {
        public int TotalQuantity { get; set; } // Tổng số xe ở kho hãng
        public int InStockQuantity { get; set; } // Có sẵn (InStock)
        public int AllocatedQuantity { get; set; } // Đã phân bổ (Allocated) - đang ship cho dealer
        public int ReadyQuantity { get; set; } // Sẵn sàng (Ready)
        public int DeliveredQuantity { get; set; } // Đã giao cho dealer (Delivered)
    }
}

