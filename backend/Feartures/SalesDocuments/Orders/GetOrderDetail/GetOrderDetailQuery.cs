using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Orders.GetOrderDetail;

public sealed class GetOrderDetailQuery : IRequest<Result<GetOrderDetailDto>>
{
    public long OrderId { get; set; } // Lấy từ route URL

}

// DTO chính, chứa toàn bộ thông tin chi tiết
public sealed class GetOrderDetailDto
{
    public long OrderId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public OrderCustomerDto Customer { get; set; } = null!;
    public OrderItemDto Item { get; set; } = null!; // Giả định mỗi đơn hàng chỉ có 1 item

    public decimal DepositAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal OutstandingAmount => TotalAmount - DepositAmount; // Tính toán số tiền còn lại
}

// DTO cho thông tin khách hàng
public sealed class OrderCustomerDto
{
    public long CustomerId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
}

// DTO cho thông tin sản phẩm trong đơn hàng
public sealed class OrderItemDto
{
    public long ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty; // Ví dụ: "VF8 Plus Red"
    public string? ProductColor { get; set; } // Màu sắc xe, nếu có
    public string? Vin { get; set; } // Số VIN đã được phân bổ cho đơn hàng này

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LinePromo { get; set; }
    public decimal LineTotal { get; set; }
}