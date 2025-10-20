using System.Text.Json.Serialization;
using Ardalis.Result;
using backend.Domain.Enums;
using MediatR;

namespace backend.Feartures.Inventories.Create
{
    /// <summary>
    /// Command tạo Inventory mới - chỉ có bên hãng (Manufacturer) mới có thể tạo.
    /// Khi OwnerType = "Manufacturer", các trường dealer/branch sẽ là null vì chưa chuyển giao.
    /// </summary>
    public sealed class CreateInventoryRequest : IRequest<Result<CreateInventoryResponse>>
    {
        public long ProductId { get; set; }
        public InventoryType OwnerType { get; set; } = InventoryType.Manufacturer; // Manufacturer -> Dealer (khi dealer nhập kho)
        public long? OwnerId { get; set; } // ID của Manufacturer lúc tạo
        public LocationType LocationType { get; set; } = LocationType.Manufacturer; // Mặc định lưu kho hãng
        public InventoryStatus Status { get; set; } = InventoryStatus.InStock; // InStock -> Allocated -> Delivered -> InStock (khi dealer nhập kho)
        public DateTime? ExpectedDeliveryDate { get; set; } // Ngày dự kiến giao hàng
        public string? Note { get; set; }
    }
}

