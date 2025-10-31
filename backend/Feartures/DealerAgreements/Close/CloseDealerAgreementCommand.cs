using Ardalis.Result;
using MediatR;

namespace backend.Feartures.DealerAgreements.Close
{
    public record CloseDealerAgreementCommand(long AgreementId) : IRequest<Result>;
}

