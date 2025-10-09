using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Dealers.Update
{
    public record UpdateDealerCommand(long DealerId, UpdateDealerRequest Body) : IRequest<Result>;
}
