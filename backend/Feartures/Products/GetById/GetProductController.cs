using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Products.Get
{
    [ApiController]
    [Route("api/product")]
    public class GetProductController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetProductController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> Get(long productId, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetProductCommand(productId), ct);

            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            else if (result.Status == ResultStatus.NotFound)
            {
                return NotFound(result.Errors);
            }
            return BadRequest(result.Errors);
        }
    }
}
