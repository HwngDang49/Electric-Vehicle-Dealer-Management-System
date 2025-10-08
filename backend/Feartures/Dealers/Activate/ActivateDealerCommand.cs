using Ardalis.Result;
using MediatR;
namespace backend.Feartures.Dealers.Activate
{
    public record ActivateDealerCommand(long DealerId) : IRequest<Result>;
}
