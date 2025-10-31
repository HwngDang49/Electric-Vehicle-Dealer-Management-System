using Ardalis.Result;
using MediatR;

namespace backend.Feartures.DealerAgreements.UpdateRebate
{
    public record UpdateAgreementRebateCommand(long AgreementId, long RebateId, UpdateAgreementRebateRequest Request) : IRequest<Result>;
}

