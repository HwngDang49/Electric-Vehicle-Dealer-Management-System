using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.PurchaseOrders.ConfirmSelect
{
    [ApiController]
    [Route("api/purchase-orders")]
    [Authorize]
    public sealed class ConfirmSelectController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ConfirmSelectController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// EVM Staff confirm PO với VIN được chọn manual (không auto FIFO)
        /// POST /api/purchase-orders/confirm-select
        /// </summary>
        [HttpPost("confirm-select")]
        public async Task<IActionResult> ConfirmSelect([FromBody] ConfirmSelectRequest request)
        {
            var userId = User.GetUserId();
            if (userId is null)
                return Unauthorized();

            var result = await _mediator.Send(new ConfirmSelectCommand(request, userId.Value));

            if (result.IsSuccess)
                return Ok(new { message = "PO confirmed successfully with selected VINs" });

            if (result.Status == Ardalis.Result.ResultStatus.NotFound)
                return NotFound(new { errors = result.Errors });

            return BadRequest(new { errors = result.Errors });
        }
    }
}

