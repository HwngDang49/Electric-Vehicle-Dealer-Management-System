using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Pricebooks.Get
{
    [ApiController]
    [Route("api/admin/pricebooks")]
    [Authorize]
    public class GetPricebookController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetPricebookController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPricebook([FromRoute] long id)
        {
            var result = await _mediator.Send(new GetPricebookCommand(id));

            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return BadRequest(result.Errors);
        }
    }
}
