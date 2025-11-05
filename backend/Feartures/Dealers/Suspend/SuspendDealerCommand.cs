using Ardalis.Result;
using backend.Common.Markers;
using MediatR;

namespace backend.Feartures.Dealers.Suspend
{
    public record SuspendDealerCommand(long DealerId) : IRequest<Result<SuspendDealerResponse>>, ITransactionalRequest;

}
