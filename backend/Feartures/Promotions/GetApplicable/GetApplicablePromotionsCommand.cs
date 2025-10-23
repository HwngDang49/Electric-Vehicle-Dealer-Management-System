using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Promotions.GetApplicable
{
    public record GetApplicablePromotionsCommand(
        long ProductId,
        long? DealerId = null
    ) : IRequest<Result<GetApplicablePromotionsResponse>>;
}

