using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Promotions.Delete
{
    [ApiController]
    [Route("api/admin/promotions")]
    [Authorize(Roles = "Admin")]
    public class DeletePromotionController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DeletePromotionController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Xóa promotion (chỉ khi Draft)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePromotion(
            [FromRoute] long id,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new DeletePromotionCommand(id), ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound)
                {
                    return NotFound(result.Errors);
                }
                return BadRequest(result.Errors);
            }

            return Ok(new { message = "Xóa promotion thành công" });
        }
    }
}

