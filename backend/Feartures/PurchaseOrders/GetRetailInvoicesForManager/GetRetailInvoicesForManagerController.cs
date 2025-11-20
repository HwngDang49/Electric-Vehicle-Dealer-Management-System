using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.PurchaseOrders.GetRetailInvoicesForManager
{
    [ApiController]
    [Route("api/purchase-orders")]
    [Authorize(Roles = "DealerStaff,DealerManager")]
    public class GetRetailInvoicesForManagerController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetRetailInvoicesForManagerController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("retail-invoices-for-manager")]
        public async Task<IActionResult> GetRetailInvoicesForManager(CancellationToken ct)
        {
            try
            {
                var query = new GetRetailInvoicesForManagerQuery();
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

