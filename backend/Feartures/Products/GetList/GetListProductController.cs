using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Products.GetList
{
    [ApiController]
    [Route("api/product")]
    public class GetListProductController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetListProductController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetList()
        {
            var result = await _mediator.Send(new GetListProductCommand());

            if (result.IsSuccess)
            {
                return Ok(result);
            }
            return BadRequest(result.Errors);
        }
    }
}
