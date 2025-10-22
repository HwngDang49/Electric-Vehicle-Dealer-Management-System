using Ardalis.Result;
using backend.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Promotions.Create
{
    [ApiController]
    [Route("api/admin/promotions")]
    [Authorize(Roles = "Admin")] // CHỈ ADMIN
    public class CreatePromotionController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreatePromotionController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Tạo promotion mới (Admin only)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreatePromotion(
            [FromBody] CreatePromotionRequest request,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new CreatePromotionCommand(request), ct);

            if (!result.IsSuccess)
            {
                return BadRequest(new { errors = result.Errors });
            }

            return CreatedAtAction(
                nameof(CreatePromotion),
                new { id = result.Value },
                new { promotionId = result.Value, message = "Tạo promotion thành công" }
            );
        }
    }
}

