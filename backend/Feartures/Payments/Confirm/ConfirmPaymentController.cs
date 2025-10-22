using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Payments.Confirm
{
    [ApiController]
    [Route("api/confirm-payment-po")]
    [Authorize] // T
    public class ConfirmPaymentController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ConfirmPaymentController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Confirm(long paymentId, [FromBody] ConfirmPaymentRequest request, CancellationToken ct)
        {
            request.PaymentId = paymentId;

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0";
            long.TryParse(userIdStr, out var userId);

            var result = await _mediator.Send(new ConfirmPaymentCommand(request, userId));

            if (result.IsSuccess)
                return Ok(result);

            return BadRequest(result);
        }
    }
}

