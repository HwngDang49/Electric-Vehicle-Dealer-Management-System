using System.Text.Json.Serialization;
using Ardalis.Result;
using MediatR;

namespace backend.Features.SalesDocuments.FinalizeQuote;

public sealed class FinalizeQuoteCommand : IRequest<Result<bool>>
{
    [JsonIgnore] public long DealerId { get; set; }   // lấy từ JWT
    public long SalesDocId { get; set; }

    // Chọn 1 trong 2 cách set khóa giá:
    public int? LockDays { get; set; }          // ví dụ 7
    public DateTime? LockedUntil { get; set; }  // nếu truyền ngày cụ thể thì ưu tiên cái này
}