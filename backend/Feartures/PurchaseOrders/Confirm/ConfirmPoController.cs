using backend.Domain.Entities;
using backend.Feartures.PurchaseOrders.Submit;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Feartures.PurchaseOrders.Approve
{
    [ApiController]
    [Route("api/Confirm-po")]
    public class ConfirmPoController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ConfirmPoController(IMediator mediator)
        {
            _mediator = mediator;
        }


        [HttpPut]
        public async Task<IActionResult> Submit([FromBody] ConfirmPoRequest req)
        {
            // Lấy id người dùng từ JWT token
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            long value = long.Parse(userId);

            var result = await _mediator.Send(new ConfirmPoCommand(req, value));

            if (result.IsSuccess)
            {
                return Ok(new { message = "Confirmed Successfully", poId = req.PoId });
            }
            return BadRequest(result.Errors);
        }
    }
}
