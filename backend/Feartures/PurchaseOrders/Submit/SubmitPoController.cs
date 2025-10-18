using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.PurchaseOrders.Submit
{
    [ApiController]
    [Route("api/submit-po")]
    public class SubmitPoController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SubmitPoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPut]
        public async Task<IActionResult> Submit([FromBody] SubmitPoRequest req)
        {

            var result = await _mediator.Send(new SubmitPoRequestCommand(req));

            if (result.IsSuccess)
            {

                return Ok("Submit Successfully");
            }
            return BadRequest(result.Errors);
        }
    }
}
