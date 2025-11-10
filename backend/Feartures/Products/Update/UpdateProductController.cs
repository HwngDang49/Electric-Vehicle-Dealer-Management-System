using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Products.Update
{
    [ApiController]
    [Route("api/admin/products")]
    [Authorize]
    public sealed class UpdateProductController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UpdateProductController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPut("{productId:long}")]
        public async Task<IActionResult> UpdateProduct(
            [FromRoute] long productId,
            [FromBody] UpdateProductRequest request,
            CancellationToken ct)
        {
            var command = new UpdateProductCommand
            {
                ProductId = productId,
                Request = request
            };

            var result = await _mediator.Send(command, ct);

            if (result.IsSuccess)
                return Ok(result.Value);

            if (result.Status == ResultStatus.NotFound)
                return NotFound(result.Errors);

            return BadRequest(result.Errors);
        }
    }
}