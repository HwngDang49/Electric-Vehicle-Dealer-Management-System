using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Claims.ApproveClaim
{
    [ApiController]
    [Route("api/claims")]
    [Authorize]
    public class ApproveClaimController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ApproveClaimController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("{claimId:long}/approve")]
        public async Task<IActionResult> ApproveClaim(
            long claimId,
            CancellationToken ct = default)
        {
            var command = new ApproveClaimCommand(claimId);
            var result = await _mediator.Send(command, ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound)
                    return NotFound(result);
                if (result.Status == ResultStatus.Forbidden)
                    return Forbid();
                return BadRequest(result);
            }

            return Ok(new { message = "Claim approved successfully" });
        }
    }
}

