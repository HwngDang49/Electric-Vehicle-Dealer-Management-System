using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Orders.BackorderOrder
{
    public record BackorderOrderCommand(long OrderId) : IRequest<Result<string>>;
}

