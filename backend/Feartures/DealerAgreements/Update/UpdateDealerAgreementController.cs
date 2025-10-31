using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.DealerAgreements.Update
{
    [ApiController]
    [Route("api/dealer-agreements")]
    [Authorize]
    public class UpdateDealerAgreementController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UpdateDealerAgreementController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPut("{agreementId:long}")]
        public async Task<IActionResult> Update(long agreementId, [FromBody] UpdateDealerAgreementRequest request, CancellationToken ct)
        {
            var result = await _mediator.Send(new UpdateDealerAgreementCommand(agreementId, request), ct);

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

