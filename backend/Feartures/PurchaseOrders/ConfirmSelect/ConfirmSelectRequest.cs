namespace backend.Feartures.PurchaseOrders.ConfirmSelect
{
    /// <summary>
    /// Request để confirm PO với VIN được chọn manual (không auto FIFO)
    /// </summary>
    public class ConfirmSelectRequest
    {
        public long PoId { get; set; }

        /// <summary>
        /// Danh sách VIN đã chọn cho từng product trong PO
        /// </summary>
        public List<VinAllocationItem> VinAllocations { get; set; } = new();
    }

    /// <summary>
    /// VIN allocation cho một product cụ thể
    /// </summary>
    public class VinAllocationItem
    {
        public long ProductId { get; set; }

        /// <summary>
        /// Danh sách VIN đã được chọn cho product này
        /// </summary>
        public List<string> SelectedVins { get; set; } = new();
    }
}

