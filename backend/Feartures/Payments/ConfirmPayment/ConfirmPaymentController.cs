using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Payments.ConfirmPayment
{
    [ApiController]
    [Route("api/confirm-payment")]
    [Authorize]
    public sealed class ConfirmPaymentController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ConfirmPaymentController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// EVM Staff xác nhận thanh toán - chuyển invoice sang Paid và trừ tiền dealer
        /// POST /api/confirm-payment/{invoiceId}
        /// </summary>
        [HttpPost("{invoiceId}")]
        public async Task<IActionResult> ConfirmPayment(long invoiceId)
        {
            var userId = User.GetUserId();
            
            if (userId is null)
                return Unauthorized();

            var request = new ConfirmPaymentRequest 
            { 
                InvoiceId = invoiceId,
                Status = "Paid" 
            };
            
            var result = await _mediator.Send(new ConfirmPaymentCommand(request, userId.Value));

            if (result.IsSuccess)
                return Ok(new { message = "Payment confirmed successfully" });

            return BadRequest(new { errors = result.Errors });
        }
    }
}

