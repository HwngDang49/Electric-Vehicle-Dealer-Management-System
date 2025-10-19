namespace backend.Feartures.Inventories.Allocate
{
    public class AllocateVinRequest
    {
        public string VinCode { get; set; } = null!;
        public long PoId { get; set; }
        public long? PoItemId { get; set; }
        public long DealerId { get; set; }     // dealer của PO (để cross-check)
        public string? Note { get; set; }
    }
}
