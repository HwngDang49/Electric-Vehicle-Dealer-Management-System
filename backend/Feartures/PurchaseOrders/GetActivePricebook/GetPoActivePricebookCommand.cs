using Ardalis.Result;
using MediatR;

namespace backend.Feartures.PurchaseOrders.GetActivePricebook
{
    public sealed class GetPoActivePricebookCommand : IRequest<Result<GetPoActivePricebookQuery>>
    {
        // Command không cần parameters, sẽ tìm và merge pricebook active từ dealer và global
    }

    public sealed class GetPoActivePricebookQuery
    {
        public List<GetPoActivePricebookItemQuery> Items { get; set; } = new();
    }

    public sealed class GetPoActivePricebookItemQuery
    {
        public long PricebookItemId { get; set; }
        public long ProductId { get; set; }
        public string ProductName { get; set; } = default!;
        public string ModelCode { get; set; } = default!;
        public string VariantCode { get; set; } = default!;
        public decimal MsrpPrice { get; set; }
        public decimal FloorPrice { get; set; }
        public long PricebookId { get; set; }
        public bool IsDealerSpecific { get; set; }
    }
}
