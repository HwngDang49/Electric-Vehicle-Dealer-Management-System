using Ardalis.Result;
using MediatR;

namespace backend.Feartures.PurchaseOrders.GetList
{
    public record GetListPoQuery(long DealerId, long CurrentUserId) : IRequest<Result<List<PoListItemDto>>>;

    public class PoListItemDto
    {
        public long PoId { get; set; }
        public long DealerId { get; set; }
        public long BranchId { get; set; }
        public string Status { get; set; } = null!;
        public DateOnly? ExpectedDate { get; set; }
        public decimal? TotalAmount { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }
        public long? CreateBy { get; set; }
        public long? SubmittedBy { get; set; }
        public long? ApprovedBy { get; set; }
        public long? ConfirmedBy { get; set; }
        public int ItemCount { get; set; }
        public int TotalQuantity { get; set; } // Add total quantity field
        public List<PoItemDto> Items { get; set; } = new(); // Add items array
    }
    
    public class PoItemDto
    {
        public long PoItemId { get; set; }
        public long ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
    }
}

