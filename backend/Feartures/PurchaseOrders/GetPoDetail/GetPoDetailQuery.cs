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
        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }
        public List<PoItemDto> Items { get; set; } = new();
        // Inventory status
        public bool InventoryReceived { get; set; } = false;
    }
    public sealed class PoItemDto
    {
        public long PoItemId { get; set; }
        public long ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? ModelCode { get; set; } // For image mapping
        public string? ImageUrl { get; set; } // Product image URL configured by admin
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
    }
}

