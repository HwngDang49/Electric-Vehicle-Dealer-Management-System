using backend.Feartures.PurchaseOrders.Approve;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MediatR;

namespace backend.Feartures.PurchaseOrders.Confirmed
{
    [ApiController]
    [Route("api/Confirmed-po")]
    public class ConfirmedPoController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ConfirmedPoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPut]
        public async Task<IActionResult> Submit([FromBody] ConfirmedPoRequest req)
        {
            // lấy id người dùng đang xài gán vô
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // lấy trong claimType của jwt
            long value = long.Parse(userId);


            var result = await _mediator.Send(new ConfirmedPoCommand(req, value));

            if (result.IsSuccess)
            {

                return Ok("Confirmed Successfully");
            }
            return BadRequest(result.Errors);
        }
    }
}
