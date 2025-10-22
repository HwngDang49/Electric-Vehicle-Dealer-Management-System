using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Pricebooks.GetActive
{
    [ApiController]
    [Route("api/pricebooks")]
    [Authorize] 
    public sealed class GetActivePricebookController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetActivePricebookController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("active")]
        public async Task<ActionResult<Result<GetActivePricebookQuery>>> GetActivePricebook(
            CancellationToken ct)
        {
            var result = await _mediator.Send(new GetActivePricebookCommand(), ct);

            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            return Ok(result.Value);
        }
    }
}
