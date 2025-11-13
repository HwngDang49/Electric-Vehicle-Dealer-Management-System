namespace backend.Feartures.PurchaseOrders.Create
{

    public class CreatePoRequest
    {
        public string BranchCode { get; set; } = default!;
        public List<CreatePoItem> PoItems { get; set; } = new();
        public DateOnly? ExpectedDate { get; set; }
    }
    public class CreatePoItem
    {
        public long ProductId { get; set; }
        public int Qty { get; set; }
    }


}
