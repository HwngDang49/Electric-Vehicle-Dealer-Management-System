using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Dealers.GetDealerCredit
{
    public record GetDealerCreditQuery(long DealerId) : IRequest<Result<DealerCreditDto>>;
}
