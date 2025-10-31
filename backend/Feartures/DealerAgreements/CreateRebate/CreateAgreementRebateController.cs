using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.DealerAgreements.CreateRebate
{
    [ApiController]
    [Route("api/dealer-agreements")]
    [Authorize]
    public class CreateAgreementRebateController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreateAgreementRebateController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("{agreementId:long}/rebates")]
        public async Task<IActionResult> Create(long agreementId, [FromBody] CreateAgreementRebateRequest request, CancellationToken ct)
        {
            var result = await _mediator.Send(new CreateAgreementRebateCommand(agreementId, request), ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound)
                    return NotFound(result);
                if (result.Status == ResultStatus.Forbidden)
                    return Forbid();
                return BadRequest(result);
            }

            var locationUrl = $"/api/dealer-agreements/{agreementId}/rebates/{result.Value}";
            return Created(locationUrl, new { rebate_id = result.Value });
        }
    }
}

