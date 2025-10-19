using backend.Domain.Entities;
using backend.Domain.Enums;

namespace backend.Feartures.Pricebooks.Create
{
    public class CreatePricebookRequest
    {
        public string Name { get; set; }
        public DateTime Effective_To { get; set; }
        public PricebookStatus Status { get; set; } = PricebookStatus.Actived;

        public List<PricebookItemUpsertDto> PricebookItems { get; set; } = new();
    }

    public sealed class PricebookItemUpsertDto
    {
        public long ProductId { get; set; }
        public decimal MsrpPrice { get; set; }
        public decimal? FloorPrice { get; set; }
        public decimal? OemDiscountAmount { get; set; }
        public decimal? OemDiscountPercent { get; set; }
    }
}
