using backend.Common.Paging;
using MediatR;

namespace backend.Feartures.SalesDocuments.Quotes.GetQuotes;

/// <summary>
/// Query để lấy danh sách Báo giá (Quotes) có phân trang và lọc.
/// </summary>
public sealed class GetQuotesQuery : IRequest<PagedResult<GetQuotesDto>>
{
    /// Lọc theo trạng thái (ví dụ: "Draft", "Finalized", "Confirmed").
    public string? Status { get; set; }

    /// Từ khóa: có thể là ID, tên/email/phone của khách hàng.
    public string? SearchTerm { get; set; }

    /// Tuỳ chọn: lọc theo hết hạn (Finalized và locked_until < now).
    /// - true  => chỉ lấy các quote đã hết hạn
    /// - false => chỉ lấy các quote còn hiệu lực
    /// - null  => bỏ qua lọc theo hết hạn
    public bool? Expired { get; set; }

    /// Trang (>=1)
    public int Page { get; set; } = 1;

    /// Số lượng / trang (1..200)
    public int PageSize { get; set; } = 20;
}

/// <summary>DTO tóm tắt một Quote để hiển thị list.</summary>
public sealed class GetQuotesDto
{
    public long QuoteId { get; set; }
    public long DealerId { get; set; }           // <-- thêm
    public long CustomerId { get; set; }
    public string CustomerName { get; set; } = default!;
    public string? Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal TotalAmount { get; set; }

    public DateTime? LockedUntil { get; set; }   // <-- thêm
    public bool IsExpired { get; set; }          // <-- set trong handler
}
