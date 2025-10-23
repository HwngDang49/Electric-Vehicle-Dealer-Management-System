using Ardalis.Result;
using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.PurchaseOrders.GetAllPurchase
{
    [ApiController]
    [Route("api/evm/purchase-orders")]
    public class GetAllPurchaseOrdersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetAllPurchaseOrdersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("all")]
        [Authorize(Roles = "EVMStaff")] // Only EVM Staff can access this endpoint
        public async Task<IActionResult> GetAllPurchaseOrders(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 100, // Default to 100 for EVM Staff to see all orders
            CancellationToken ct = default)
        {
            try
            {
                // Get current user ID from JWT token
                var userId = User.GetUserId();
                
                if (userId == null)
                    return Unauthorized(new { error = "User ID not found in token" });

                var query = new GetAllPurchaseOrdersQuery(userId.Value, page, pageSize);

                var result = await _mediator.Send(query, ct);

                if (result.IsSuccess)
                {
                    return Ok(result.Value);
                }
                else
                {
                    return BadRequest(result.Errors);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

    }
}
