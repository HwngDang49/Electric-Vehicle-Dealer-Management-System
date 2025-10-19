using Ardalis.Result;
using backend.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Pricebooks.UpdateStatus
{
    [ApiController]
    [Route("api/evm/pricebooks")]
    [Authorize]
    public sealed class UpdatePricebookStatusController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UpdatePricebookStatusController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult<Result>> UpdateStatus(
            [FromRoute] long id,
            [FromBody] UpdatePricebookStatusRequest request,
            CancellationToken ct)
        {
            var command = new UpdatePricebookStatusCommand
            {
                PricebookId = id,
                Status = request.Status
            };

            var result = await _mediator.Send(command, ct);

            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }

    public sealed class UpdatePricebookStatusRequest
    {
        public PricebookStatus Status { get; set; }
    }
}
