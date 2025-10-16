using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Products.Create
{
    [ApiController]
    [Route("api/product")]

    public class CreateProductController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreateProductController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
        {
            var result = await _mediator.Send(new CreateProductCommand(request));

            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }

            return BadRequest("Create Fail!!!!!");
        }

    }
}
