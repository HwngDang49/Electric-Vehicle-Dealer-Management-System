using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Promotions.Get
{
    [ApiController]
    [Route("api/admin/promotions")]
    [Authorize(Roles = "Admin")]
    public class GetPromotionController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetPromotionController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy chi tiết promotion (Admin only)
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPromotion(
            [FromRoute] long id,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new GetPromotionCommand(id), ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound)
                {
                    return NotFound(result.Errors);
                }
                return BadRequest(result.Errors);
            }

            return Ok(new { data = result.Value });
        }
    }
}

