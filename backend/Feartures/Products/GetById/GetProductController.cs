using System.Formats.Asn1;
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
        public async Task<IActionResult> Get(long productId)
        {
            var ressult = await _mediator.Send(new GetProductCommand(productId));

            if (ressult.IsSuccess)
            {
                return Ok(ressult);
            }
            return BadRequest(ressult.Errors);
        }
    }
}
