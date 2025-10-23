using Ardalis.Result;
using MediatR;

namespace backend.Feartures.PurchaseOrders.GetAllPurchase
{
    public record GetAllPurchaseOrdersQuery(long CurrentUserId) : IRequest<Result<List<PoListItemDto>>>;
}
