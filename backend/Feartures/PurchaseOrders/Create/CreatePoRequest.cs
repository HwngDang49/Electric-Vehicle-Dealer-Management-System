using backend.Domain.Enums;

namespace backend.Feartures.PurchaseOrders.Create
{

    public class CreatePoRequest
    {
        public long DealerId { get; set; }
        public long BranchId { get; set; }
        public POStatus Status { get; set; } = POStatus.Draft;
        public List<CreatePoItem> PoItems { get; set; } = new();
    }
    public class CreatePoItem
    {
        public long ProductId { get; set; }
        public int Qty { get; set; }
        public decimal UnitPrice { get; set; }
    }


}
