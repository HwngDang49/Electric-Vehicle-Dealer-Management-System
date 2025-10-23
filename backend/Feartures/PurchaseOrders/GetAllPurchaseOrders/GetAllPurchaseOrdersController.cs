using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.PurchaseOrders.GetAllPurchaseOrders
{
    [ApiController]
    [Route("api/purchase-orders")]
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
                var query = new GetAllPurchaseOrdersQuery();

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
