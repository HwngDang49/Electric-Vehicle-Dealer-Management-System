using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Pricebooks.GetActive
{
    public sealed class GetActivePricebookCommand : IRequest<Result<GetActivePricebookQuery>>
    {
        // Command không cần parameters, sẽ tìm pricebook active hiện tại
    }

    public sealed class GetActivePricebookQuery
    {
        public long PricebookId { get; set; }
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public DateOnly? EffectiveFrom { get; set; }
        public DateOnly? EffectiveTo { get; set; }
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public List<GetActivePricebookItemQuery> Items { get; set; } = new();
    }

    public sealed class GetActivePricebookItemQuery
    {
        public long PricebookItemId { get; set; }
        public long ProductId { get; set; }
        public string ProductName { get; set; } = default!;
        public string ModelCode { get; set; } = default!;
        public string VariantCode { get; set; } = default!;
        public decimal MsrpPrice { get; set; }
        public decimal? FloorPrice { get; set; }
        public decimal? OemDiscountAmount { get; set; }
        public decimal? OemDiscountPercent { get; set; }
    }
}
