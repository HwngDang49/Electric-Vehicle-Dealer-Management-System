using backend.Domain.Enums;

namespace backend.Feartures.Pricebooks.Update
{
    public class UpdatePricebookRequest
    {
        public string? Name { get; set; }
        public long MsrpPrice { get; set; }
        public long FloorPrice { get; set; }
        public DateOnly? EffectiveTo { get; set; }
        public PricebookStatus Status { get; set; } = PricebookStatus.Actived;
    }
}
