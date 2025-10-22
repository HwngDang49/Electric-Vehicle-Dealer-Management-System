using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Pricebooks.DeleteItem
{
    public record DeleteItemCommand(long PricebookId, long ItemId) : IRequest<Result>;
}

