using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Promotions.GetAll
{
    [ApiController]
    [Route("api/admin/promotions")]
    [Authorize(Roles = "Admin")]
    public class GetAllPromotionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetAllPromotionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách promotions (Admin only)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllPromotions(
            [FromQuery] long? dealerId = null,
            [FromQuery] string? status = null,
            [FromQuery] DateOnly? effectiveDate = null,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(
                new GetAllPromotionsCommand(dealerId, status, effectiveDate), 
                ct
            );

            if (!result.IsSuccess)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { data = result.Value });
        }
    }
}

