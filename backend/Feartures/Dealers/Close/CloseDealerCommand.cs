using Ardalis.Result;
using backend.Common.Markers;
using MediatR;

namespace backend.Feartures.Dealers.Close
{
    public record CloseDealerCommand(long DealerId) : IRequest<Result<CloseDealerResponse>>, ITransactionalRequest;
}
