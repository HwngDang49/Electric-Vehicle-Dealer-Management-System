using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Pricebooks.Create
{
    [ApiController]
    [Route("api/pricebook")]
    public class CreatePricebookController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreatePricebookController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePricebookRequest request)
        {
            var result = await _mediator.Send(new CreatePricebookCommand(request));

            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return BadRequest(result.Errors);
        }
    }
}
