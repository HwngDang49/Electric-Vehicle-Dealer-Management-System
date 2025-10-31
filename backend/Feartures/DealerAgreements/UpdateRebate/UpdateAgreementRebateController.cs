using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.DealerAgreements.UpdateRebate
{
    [ApiController]
    [Route("api/dealer-agreements")]
    [Authorize]
    public class UpdateAgreementRebateController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UpdateAgreementRebateController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPut("{agreementId:long}/rebates/{rebateId:long}")]
        public async Task<IActionResult> Update(
            long agreementId,
            long rebateId,
            [FromBody] UpdateAgreementRebateRequest request,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new UpdateAgreementRebateCommand(agreementId, rebateId, request), ct);

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

