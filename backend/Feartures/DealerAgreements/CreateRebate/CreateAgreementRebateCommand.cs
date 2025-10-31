using Ardalis.Result;
using MediatR;

namespace backend.Feartures.DealerAgreements.CreateRebate
{
    public record CreateAgreementRebateCommand(long AgreementId, CreateAgreementRebateRequest Request) : IRequest<Result<long>>;
}

