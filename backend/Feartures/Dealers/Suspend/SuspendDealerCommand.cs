using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Dealers.Suspend
{
    public record SuspendDealerCommand(long DealerId) : IRequest<Result>;

}
