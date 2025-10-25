using Ardalis.Result;
using MediatR;
using backend.Feartures.PurchaseOrders.GetAllPurchase;
using PagedResult = backend.Common.Paging.PagedResult<backend.Feartures.PurchaseOrders.GetAllPurchase.PoListItemDto>;

namespace backend.Feartures.PurchaseOrders.GetAllPurchase
{
    public record GetAllPurchaseOrdersQuery(long CurrentUserId, int Page = 1, int PageSize = 5, string? Status = null) : IRequest<Result<PagedResult>>;
}
