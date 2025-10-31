using Ardalis.Result;
using MediatR;

namespace backend.Feartures.DealerAgreements.Create
{
    public record CreateDealerAgreementCommand(CreateDealerAgreementRequest Request) : IRequest<Result<long>>;
}

