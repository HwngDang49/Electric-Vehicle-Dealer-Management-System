using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Products.GetAllProducts
{
    [ApiController]
    [Route("api/admin/products")]
    [Authorize] // Required to get dealerId from JWT token
    public sealed class GetAllProductsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetAllProductsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("all")]
        public async Task<ActionResult<Result<List<GetAllProductsQuery>>>> GetAllProducts(
            CancellationToken ct)
        {
            var result = await _mediator.Send(new GetAllProductsCommand(), ct);

            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            return Ok(result.Value);
        }
    }
}
