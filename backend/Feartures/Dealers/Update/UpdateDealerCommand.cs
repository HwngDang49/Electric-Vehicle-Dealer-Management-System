using Ardalis.Result;
using backend.Common.Markers;
using MediatR;

namespace backend.Feartures.Dealers.Update
{
    public record UpdateDealerCommand(long DealerId, UpdateDealerRequest Body) : IRequest<Result<UpdateDealerResponse>>, ITransactionalRequest;
}
