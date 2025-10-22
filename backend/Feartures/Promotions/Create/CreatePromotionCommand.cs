using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Promotions.Create
{
    public record CreatePromotionCommand(CreatePromotionRequest Request) : IRequest<Result<long>>;
}

