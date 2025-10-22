using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Pricebooks.Update
{
    public record UpdatePricebookFullCommand(long Id, UpdatePricebookFullRequest Request) : IRequest<Result>;
}

