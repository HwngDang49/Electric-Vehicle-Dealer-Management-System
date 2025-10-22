using MediatR;

namespace backend.Feartures.Inventories.GetListVin
{
    public class GetListVinQuery : IRequest<List<VinListItemDto>>
    {
        public string? SearchTerm { get; set; } // Tìm theo tên kho, mã kho, chi nhánh
        public long? BranchId { get; set; } // Filter theo chi nhánh
        public string? Status { get; set; } // Filter theo trạng thái
        public string? LocationType { get; set; } // Filter theo loại kho
    }

    public class VinListItemDto
    {
        public long BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public string BranchCode { get; set; } = string.Empty;
        public string BranchAddress { get; set; } = string.Empty;
        public VinQuantityInfo QuantityInfo { get; set; } = new();
        public DateTime LastUpdated { get; set; }
    }

    public class VinQuantityInfo
    {
        public int TotalQuantity { get; set; } // Tổng số xe
        public int InStockQuantity { get; set; } // Có sẵn (InStock)
        public int AllocatedQuantity { get; set; } // Đã phân bổ (Allocated)
        public int ReadyQuantity { get; set; } // Sẵn sàng (Ready)
        public int DeliveredQuantity { get; set; } // Đã giao (Delivered)
        public List<ProductQuantityInfo> ProductBreakdown { get; set; } = new();
    }

    public class ProductQuantityInfo
    {
        public long ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ColorName { get; set; } = string.Empty;
        public int TotalCount { get; set; }
        public int InStockCount { get; set; }
        public int AllocatedCount { get; set; }
        public int ReadyCount { get; set; }
        public int DeliveredCount { get; set; }
    }

}
