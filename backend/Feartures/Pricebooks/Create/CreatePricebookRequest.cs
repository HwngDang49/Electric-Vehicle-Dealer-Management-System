using backend.Domain.Enums;

namespace backend.Feartures.Pricebooks.Create
{
    public class CreatePricebookRequest
    {
        public long ProductId { get; set; }
        public string Name { get; set; }
        public long MsrpPrice { get; set; }
        public long FloorPrice { get; set; }
        public DateTime Effective_To { get; set; }
        public PricebookStatus Status { get; set; } = PricebookStatus.Actived;

    }
}
