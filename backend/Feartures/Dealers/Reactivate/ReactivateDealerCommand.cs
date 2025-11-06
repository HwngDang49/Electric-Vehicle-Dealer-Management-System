using Ardalis.Result;
using backend.Common.Markers;
using MediatR;

namespace backend.Feartures.Dealers.Reactivate
{
    public record ReactivateDealerCommand(long DealerId) : IRequest<Result<ReactivateDealerResponse>>, ITransactionalRequest;
}
