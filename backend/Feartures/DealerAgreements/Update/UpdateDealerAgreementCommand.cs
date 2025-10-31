using Ardalis.Result;
using MediatR;

namespace backend.Feartures.DealerAgreements.Update
{
    public record UpdateDealerAgreementCommand(long AgreementId, UpdateDealerAgreementRequest Request) : IRequest<Result>;
}

