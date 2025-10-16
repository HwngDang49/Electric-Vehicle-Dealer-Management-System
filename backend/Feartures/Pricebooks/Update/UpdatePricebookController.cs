using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Pricebooks.Update
{
    [ApiController]
    [Route("api/pricebook")]
    public class UpdatePricebookController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UpdatePricebookController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpPut]
        public async Task<IActionResult> Update(long pricebookId, [FromBody] UpdatePricebookRequest request)
        {
            var result = await _mediator.Send(new UpdatePricebookCommand(pricebookId, request));

            if (result.IsSuccess)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }
    }
}
