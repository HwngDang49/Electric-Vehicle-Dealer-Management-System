using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.PurchaseOrders.GetActivePricebook
{
    [ApiController]
    [Route("api/purchase-orders")]
    [Authorize]
    public sealed class GetPoActivePricebookController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetPoActivePricebookController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("active-pricebook")]
        public async Task<ActionResult<Result<GetPoActivePricebookQuery>>> GetPoActivePricebook(
            CancellationToken ct)
        {
            var result = await _mediator.Send(new GetPoActivePricebookCommand(), ct);

            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            return Ok(result.Value);
        }
    }
}
