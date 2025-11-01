using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Claims.ApproveClaim
{
    public sealed class ApproveClaimCommand : IRequest<Result>
    {
        public long ClaimId { get; set; }

        public ApproveClaimCommand(long claimId)
        {
            ClaimId = claimId;
        }
    }
}

