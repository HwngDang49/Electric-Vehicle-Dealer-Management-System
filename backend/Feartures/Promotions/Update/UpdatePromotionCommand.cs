using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Promotions.Update
{
    public record UpdatePromotionCommand(long PromotionId, UpdatePromotionRequest Request) : IRequest<Result>;

    public record UpdatePromotionStatusCommand(long PromotionId, UpdatePromotionStatusRequest Request) : IRequest<Result>;
}

