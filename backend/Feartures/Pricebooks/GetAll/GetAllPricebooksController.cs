using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Pricebooks.GetAll
{
    [ApiController]
    [Route("api/admin/pricebooks")]
    [Authorize]
    public class GetAllPricebooksController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetAllPricebooksController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách tất cả pricebooks của dealer hiện tại
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllPricebooks([FromQuery] string? status = null)
        {
            try
            {
                var result = await _mediator.Send(new GetAllPricebooksCommand(status));

                if (result.IsSuccess)
                {
                    return Ok(new
                    {
                        message = "Lấy danh sách pricebooks thành công",
                        data = result.Value
                    });
                }

                return BadRequest(new
                {
                    message = "Không thể lấy danh sách pricebooks",
                    errors = result.Errors
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi hệ thống khi lấy danh sách pricebooks",
                    error = ex.Message
                });
            }
        }
    }
}
