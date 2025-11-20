namespace backend.Feartures.PurchaseOrders.GetRetailInvoicesForManager
{
    public class GetRetailInvoicesForManagerResponse
    {
        public List<PieChartDataItem> PieChartData { get; set; } = new();
    }

    public class PieChartDataItem
    {
        public string Name { get; set; } = string.Empty;
        public int Value { get; set; }
    }
}

