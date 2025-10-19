using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Products.Create
{
    [ApiController]
    [Route("api/admin/products")]
    [Authorize]
    public class CreateProductController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreateProductController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<ActionResult<Result<long>>> CreateProduct(
            [FromBody] CreateProductRequest request,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new CreateProductCommand(request), ct);

            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            return Ok(new { product_id = result.Value });
        }
    }
}
