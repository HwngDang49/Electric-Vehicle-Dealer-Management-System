using Ardalis.Result;
using backend.Domain.Enums;
using backend.Feartures.Branches.GetBranch;
using MediatR;

namespace backend.Feartures.PurchaseOrders.GetPo
{
    public record GetPoDetailQuery(long PoId) : IRequest<Result<GetPoDetailDto>>;

    public class GetPoDetailDto
    {
        public long PoId { get; set; }
        public long DealerId { get; set; }
        public string Status { get; set; } = default!; // PoStatus string
        // Audit
        public long? SubmittedByUserId { get; set; }
        public DateTimeOffset? SubmittedAt { get; set; }
        public List<PoItemDto> Items { get; set; } = new();
    }
    public sealed class PoItemDto
    {
        public long PoItemId { get; set; }
        public long ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
    }
}

