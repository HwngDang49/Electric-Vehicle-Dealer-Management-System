using Ardalis.Result;
using MediatR;

namespace backend.Feartures.PurchaseOrders.GetAllPurchaseOrders
{
    public record GetAllPurchaseOrdersQuery() : IRequest<Result<List<PoListItemDto>>>;
}
