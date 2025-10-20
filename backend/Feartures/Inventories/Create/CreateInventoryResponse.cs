namespace backend.Feartures.Inventories.Create
{
    public sealed class CreateInventoryResponse
    {
        public string Vin { get; set; } = default!;
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public long ProductId { get; set; }
        public DateTime? ExpectedDeliveryDate { get; set; }
        public string NextStep { get; set; } = "Inventory đã được tạo, sẵn sàng để allocate cho dealer";
    }
}
