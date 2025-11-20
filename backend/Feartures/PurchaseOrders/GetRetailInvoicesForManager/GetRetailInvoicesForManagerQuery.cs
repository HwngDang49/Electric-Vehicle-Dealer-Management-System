using Ardalis.Result;
using MediatR;

namespace backend.Feartures.PurchaseOrders.GetRetailInvoicesForManager
{
    public record GetRetailInvoicesForManagerQuery : IRequest<Result<GetRetailInvoicesForManagerResponse>>;
}

