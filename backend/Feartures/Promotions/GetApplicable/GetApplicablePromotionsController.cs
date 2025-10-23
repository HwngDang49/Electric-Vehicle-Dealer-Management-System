using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Common.Auth;

namespace backend.Feartures.Promotions.GetApplicable
{
    [ApiController]
    [Route("api/dealer/promotions")]
    [Authorize(Roles = "DealerStaff,DealerManager")]
    public class GetApplicablePromotionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetApplicablePromotionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách promotions áp dụng cho sản phẩm (Dealer Staff/Manager)
        /// </summary>
        [HttpGet("applicable")]
        public async Task<IActionResult> GetApplicablePromotions(
            [FromQuery] long productId,
            CancellationToken ct = default)
        {
            // Lấy dealerId từ claims
            var dealerId = User.GetDealerId();

            var result = await _mediator.Send(
                new GetApplicablePromotionsCommand(productId, dealerId), 
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

