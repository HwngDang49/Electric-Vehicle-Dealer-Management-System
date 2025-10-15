using backend.Domain.Entities;
using backend.Feartures.PurchaseOrders.Submit;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Feartures.PurchaseOrders.Approve
{
    [ApiController]
    [Route("api/Approve-po")]
    public class ApprovePoController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ApprovePoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPut]
        public async Task<IActionResult> Submit([FromBody] ApprovePoRequest req)
        {
            // lấy id người dùng đang xài gán vô
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // lấy trong claimType của jwt
            long value = long.Parse(userId);


            var result = await _mediator.Send(new ApprovePoCommand(req, value));

            if (result.IsSuccess)
            {

                return Ok("Approve Successfully");
            }
            return BadRequest(result.Errors);
        }
    }
}
