using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Products.UpdateStatus
{
    [ApiController]
    [Route("api/evm/products")]
    [Authorize]
    public sealed class UpdateProductStatusController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UpdateProductStatusController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPatch("{productId:long}/status")]
        public async Task<ActionResult<Result>> UpdateProductStatus(
            [FromRoute] long productId,
            [FromBody] UpdateProductStatusCommand command,
            CancellationToken ct)
        {
            command.ProductId = productId;

            var result = await _mediator.Send(command, ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound) return NotFound(result);
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
