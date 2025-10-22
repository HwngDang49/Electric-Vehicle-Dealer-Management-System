using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Promotions.GetAll
{
    public record GetAllPromotionsCommand(
        long? DealerId = null,
        string? Status = null,
        DateOnly? EffectiveDate = null
    ) : IRequest<Result<List<GetAllPromotionsQuery>>>;
}

