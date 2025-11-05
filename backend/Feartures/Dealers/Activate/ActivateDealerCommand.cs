using Ardalis.Result;
using backend.Common.Markers;
using MediatR;

namespace backend.Feartures.Dealers.Activate
{
    public record ActivateDealerCommand(long DealerId) : IRequest<Result<ActivateDealerResponse>>, ITransactionalRequest;
}
