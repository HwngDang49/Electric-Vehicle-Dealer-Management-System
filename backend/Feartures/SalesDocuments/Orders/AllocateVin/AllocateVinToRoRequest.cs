namespace backend.Feartures.SalesDocuments.Orders.AllocateVin
{
    public class AllocateVinToRoRequest
    {
        public long OrderId { get; set; }
        public string VinCode { get; set; } = null!;
        public long? OrderLineId { get; set; }      // chỉ định dòng; nếu null sẽ auto-match theo ProductId
        public string? Note { get; set; }
    }
}
