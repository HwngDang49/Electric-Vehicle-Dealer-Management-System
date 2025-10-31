using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.DealerAgreements.Close
{
    [ApiController]
    [Route("api/dealer-agreements")]
    [Authorize]
    public class CloseDealerAgreementController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CloseDealerAgreementController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("{agreementId:long}/close")]
        public async Task<IActionResult> Close(long agreementId, CancellationToken ct)
        {
            var result = await _mediator.Send(new CloseDealerAgreementCommand(agreementId), ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound)
                    return NotFound(result);
                if (result.Status == ResultStatus.Forbidden)
                    return Forbid();
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}

