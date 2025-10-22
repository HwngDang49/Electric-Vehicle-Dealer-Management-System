using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Promotions.Get
{
    public record GetPromotionCommand(long PromotionId) : IRequest<Result<GetPromotionQuery>>;
}

