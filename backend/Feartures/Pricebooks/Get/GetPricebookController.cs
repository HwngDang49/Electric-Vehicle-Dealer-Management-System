using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Pricebooks.Get
{
    [ApiController]
    [Route("api/pricebook")]
    [Authorize]
    public class GetPricebookController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetPricebookController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet]
        public async Task<IActionResult> GetPricebook(long pricebookId)
        {
            var result = await _mediator.Send(new GetPricebookCommand(pricebookId));

            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return BadRequest(result.Errors);
        }
    }
}
