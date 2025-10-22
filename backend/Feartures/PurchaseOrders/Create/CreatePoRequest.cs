using backend.Domain.Enums;

namespace backend.Feartures.PurchaseOrders.Create
{

    public class CreatePoRequest
    {
        public string BranchCode { get; set; } = default!;
        public List<CreatePoItem> PoItems { get; set; } = new();
    }
    public class CreatePoItem
    {
        public long ProductId { get; set; }
        public int Qty { get; set; }
    }


}
