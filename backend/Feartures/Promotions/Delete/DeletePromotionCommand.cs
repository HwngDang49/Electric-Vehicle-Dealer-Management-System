using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Promotions.Delete
{
    public record DeletePromotionCommand(long PromotionId) : IRequest<Result>;
}

