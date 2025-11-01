using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Claims.RejectClaim
{
    public sealed class RejectClaimCommand : IRequest<Result>
    {
        public long ClaimId { get; set; }
        public string? Reason { get; set; } // Optional: lý do reject

        public RejectClaimCommand(long claimId, string? reason = null)
        {
            ClaimId = claimId;
            Reason = reason;
        }
    }
}

