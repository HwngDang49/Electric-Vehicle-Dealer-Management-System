using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Dealers.Reactivate
{
    public record ReactivateDealerCommand(long DealerId) : IRequest<Result>;
}
