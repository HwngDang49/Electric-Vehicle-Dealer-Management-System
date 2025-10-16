using System.Text.Json.Serialization;
using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Quotes.ConvertToOrder;

public sealed class ConvertToOrderCommand : IRequest<Result<ConvertToOrderResponse>>
{
    [JsonIgnore]
    public long SalesDocId { get; set; }

    // Cờ xác nhận từ UI. Mặc định là false.
    public bool ConfirmChanges { get; set; } = false;
}

public sealed class ConvertToOrderResponse
{
    // Chỉ có giá trị khi đơn hàng được tạo thành công
    public long? OrderId { get; set; }

    // Cờ cho UI biết có cần hiển thị hộp thoại xác nhận hay không
    public bool RequiresConfirmation { get; set; }

    // Dữ liệu để hiển thị trong hộp thoại so sánh
    public ChangeSummaryDto? ChangeSummary { get; set; }
}

public sealed class ChangeSummaryDto
{
    public decimal OldTotalAmount { get; set; }
    public decimal NewTotalAmount { get; set; }
    public decimal OldLinePromo { get; set; }
    public decimal NewLinePromo { get; set; }
}