using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Inventories.Receive
{
    [ApiController]
    [Route("api/inventories")]
    [Authorize]
    public class ReceiveInventoryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ReceiveInventoryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("receive")]
        public async Task<ActionResult<Result<ReceiveInventoryResponse>>> ReceiveInventory(
            [FromBody] ReceiveInventoryRequest request,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new ReceiveInventoryCommand(request), ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound) return NotFound(result);
                if (result.Status == ResultStatus.Forbidden) return Forbid();
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
