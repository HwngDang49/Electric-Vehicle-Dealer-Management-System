using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Promotions.Update
{
    [ApiController]
    [Route("api/admin/promotions")]
    [Authorize(Roles = "Admin")]
    public class UpdatePromotionController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UpdatePromotionController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Update promotion (chỉ khi Draft)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePromotion(
            [FromRoute] long id,
            [FromBody] UpdatePromotionRequest request,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new UpdatePromotionCommand(id, request), ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound)
                {
                    return NotFound(result.Errors);
                }
                return BadRequest(result.Errors);
            }

            return Ok(new { message = "Cập nhật promotion thành công" });
        }

        /// <summary>
        /// Update status của promotion
        /// </summary>
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdatePromotionStatus(
            [FromRoute] long id,
            [FromBody] UpdatePromotionStatusRequest request,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new UpdatePromotionStatusCommand(id, request), ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound)
                {
                    return NotFound(result.Errors);
                }
                return BadRequest(result.Errors);
            }

            return Ok(new { message = "Cập nhật trạng thái promotion thành công" });
        }
    }
}

