using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.CompleteDelivery
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class CompleteDeliveryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CompleteDeliveryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("complete-delivery")]
        public async Task<IActionResult> CompleteDelivery([FromBody] CompleteDeliveryRequest request)
        {
            try
            {
                var result = await _mediator.Send(new CompleteDeliveryCommand(request));

                if (result.IsSuccess)
                {
                    return Ok(new
                    {
                        message = "Bàn giao đơn hàng thành công",
                        data = result.Value
                    });
                }

                return BadRequest(new
                {
                    message = "Không thể hoàn thành bàn giao đơn hàng",
                    errors = result.Errors
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi hệ thống khi hoàn thành bàn giao",
                    error = ex.Message
                });
            }
        }
    }
}
