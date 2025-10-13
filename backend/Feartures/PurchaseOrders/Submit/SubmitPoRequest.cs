using backend.Domain.Enums;

namespace backend.Feartures.PurchaseOrders.Submit
{
    public class SubmitPoRequest
    {
        public long PoId { get; set; }
        public long DealerId { get; set; }
        public long BranchId { get; set; }
    }
}
