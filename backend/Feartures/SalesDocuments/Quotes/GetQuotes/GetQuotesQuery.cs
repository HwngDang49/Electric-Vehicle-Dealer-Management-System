using System.Text.Json.Serialization;
using backend.Common.Paging;
using MediatR;

namespace backend.Feartures.SalesDocuments.Quotes.GetQuotes;

/// <summary>
/// Query để lấy danh sách Báo giá (Quotes) có phân trang và lọc.
/// </summary>
public sealed class GetQuotesQuery : IRequest<PagedResult<GetQuotesDto>>
{
    /// <summary>
    /// ID của đại lý. Sẽ được tự động gán từ token của người dùng.
    /// </summary>
    [JsonIgnore]
    public long DealerId { get; set; }

    /// <summary>
    /// Lọc theo trạng thái (ví dụ: "Draft", "Finalized").
    /// </summary>
    public string? Status { get; set; }

    /// <summary>
    /// Từ khóa tìm kiếm (có thể là ID báo giá, hoặc tên/email/phone của khách hàng).
    /// </summary>
    public string? SearchTerm { get; set; }

    /// <summary>
    /// Số trang muốn lấy (bắt đầu từ 1).
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Số lượng mục trên mỗi trang.
    /// </summary>
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// DTO chứa thông tin tóm tắt của một Báo giá.
/// </summary>
public sealed class GetQuotesDto
{
    public long SalesDocId { get; set; }
    public long CustomerId { get; set; }
    public string CustomerName { get; set; } = default!;
    public string? Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal TotalAmount { get; set; }
}
