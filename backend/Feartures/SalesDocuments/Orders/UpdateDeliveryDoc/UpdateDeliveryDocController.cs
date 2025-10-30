using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.UpdateDeliveryDoc
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class UpdateDeliveryDocController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UpdateDeliveryDocController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPatch("update-delivery-doc")]
        public async Task<IActionResult> UpdateDeliveryDoc([FromBody] UpdateDeliveryDocRequest request)
        {
            try
            {
                var result = await _mediator.Send(new UpdateDeliveryDocCommand(request));

                if (result.IsSuccess)
                {
                    return Ok(new
                    {
                        message = "Cập nhật tài liệu bàn giao xe thành công",
                        data = result.Value
                    });
                }

                return BadRequest(new
                {
                    message = "Không thể cập nhật tài liệu bàn giao xe",
                    errors = result.Errors
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi hệ thống khi cập nhật tài liệu bàn giao xe",
                    error = ex.Message
                });
            }
        }
    }
}

