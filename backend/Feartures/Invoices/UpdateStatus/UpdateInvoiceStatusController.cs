using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Invoices.UpdateStatus
{
    [ApiController]
    [Route("api/invoices")]
    [Authorize]
    public sealed class UpdateInvoiceStatusController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UpdateInvoiceStatusController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPatch("{invoiceId}/status")]
        public async Task<IActionResult> UpdateStatus(long invoiceId, [FromBody] UpdateInvoiceStatusRequest request)
        {
            request.InvoiceId = invoiceId;
            var userId = User.GetUserId();
            
            if (userId is null)
                return Unauthorized();

            var result = await _mediator.Send(new UpdateInvoiceStatusCommand(request, userId.Value));

            if (result.IsSuccess)
                return Ok(new { message = "Invoice status updated successfully" });

            return BadRequest(new { errors = result.Errors });
        }
    }
}

