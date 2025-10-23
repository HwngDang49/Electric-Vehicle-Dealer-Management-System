using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.PurchaseOrders.Delivery.Confirm
{
    [ApiController]
    [Route("api/po/receive-vin")]
    [Authorize]
    public sealed class ConfirmDeliveryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ConfirmDeliveryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Confirm([FromBody] ConfirmDeliveryRequest request)
        {
            // Lấy id người dùng từ JWT token
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }
            
            long value = long.Parse(userId);

            var result = await _mediator.Send(new ConfirmDeliveryCommand(request, value));
            
            if (result.IsSuccess)
            {
                return Ok(new { message = "Delivery confirmed successfully", data = result.Value });
            }
            return BadRequest(result.Errors);
        }
    }
}


