using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Claims.RejectClaim
{
    [ApiController]
    [Route("api/claims")]
    [Authorize]
    public class RejectClaimController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RejectClaimController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("{claimId:long}/reject")]
        public async Task<IActionResult> RejectClaim(
            long claimId,
            [FromBody] RejectClaimRequest? request = null,
            CancellationToken ct = default)
        {
            var command = new RejectClaimCommand(claimId, request?.Reason);
            var result = await _mediator.Send(command, ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound)
                    return NotFound(result);
                if (result.Status == ResultStatus.Forbidden)
                    return Forbid();
                return BadRequest(result);
            }

            return Ok(new { message = "Claim rejected successfully" });
        }
    }

    public class RejectClaimRequest
    {
        public string? Reason { get; set; }
    }
}

