using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.ScheduleDelivery
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class ScheduleDeliveryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ScheduleDeliveryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("schedule-delivery")]
        public async Task<IActionResult> ScheduleDelivery([FromBody] ScheduleDeliveryRequest request)
        {
            try
            {
                var result = await _mediator.Send(new ScheduleDeliveryCommand(request));

                if (result.IsSuccess)
                {
                    return Ok(new
                    {
                        message = "Lịch giao hàng đã được đặt thành công",
                        data = result.Value
                    });
                }

                return BadRequest(new
                {
                    message = "Không thể đặt lịch giao hàng",
                    errors = result.Errors
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi hệ thống khi đặt lịch giao hàng",
                    error = ex.Message
                });
            }
        }
    }
}
