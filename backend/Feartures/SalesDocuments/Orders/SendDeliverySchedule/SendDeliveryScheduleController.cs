using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.SendDeliverySchedule
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class SendDeliveryScheduleController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SendDeliveryScheduleController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("send-delivery-schedule")]
        public async Task<IActionResult> SendDeliverySchedule(
            [FromBody] SendDeliveryScheduleRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new SendDeliveryScheduleCommand(request), cancellationToken);

            if (!result.IsSuccess)
            {
                return BadRequest(new
                {
                    message = "Không thể gửi lịch giao xe",
                    errors = result.Errors
                });
            }

            return Ok(new
            {
                message = "Lịch giao xe đã được gửi tới khách hàng qua email",
                data = result.Value
            });
        }
    }
}

