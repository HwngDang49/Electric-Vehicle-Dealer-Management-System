using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Pricebooks.Update
{
    [ApiController]
    [Route("api/admin/pricebooks")]
    [Authorize]
    public class UpdatePricebookController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UpdatePricebookController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Cập nhật toàn bộ thông tin bảng giá
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFull(
            [FromRoute] long id,
            [FromBody] UpdatePricebookFullRequest request,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new UpdatePricebookFullCommand(id, request), ct);

            if (!result.IsSuccess)
            {
                if (result.Status == Ardalis.Result.ResultStatus.NotFound)
                {
                    return NotFound(result.Errors);
                }
                return BadRequest(result.Errors);
            }

            return Ok(new { message = "Cập nhật bảng giá thành công" });
        }

        /// <summary>
        /// Cập nhật trạng thái bảng giá (Active/Inactive) - Quick action
        /// </summary>
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
            [FromRoute] long id,
            [FromBody] UpdatePricebookStatusRequest request,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new UpdatePricebookStatusCommand(id, request), ct);

            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
