using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Rebates.CreateSettlement
{
    [ApiController]
    [Route("api/rebates")]
    [Authorize]
    public class CreateRebateSettlementController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreateRebateSettlementController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("settlements")]
        public async Task<IActionResult> CreateSettlement(
            [FromBody] CreateRebateSettlementRequest request,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new CreateRebateSettlementCommand(request), ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound)
                    return NotFound(result);
                return BadRequest(result);
            }

            return Ok(new { settlement_id = result.Value });
        }
    }
}

