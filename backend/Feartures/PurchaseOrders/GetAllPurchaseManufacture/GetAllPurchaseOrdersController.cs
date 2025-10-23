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
        public async Task<IActionResult> GetAllPurchaseOrders(CancellationToken ct)
        {
            try
            {
                // For testing, use a default userId
                var userId = 1L;
                var query = new GetAllPurchaseOrdersQuery(userId);

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
