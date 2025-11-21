using Ardalis.Result;
using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.PurchaseOrders.Cancel;

[ApiController]
[Route("api/purchase-orders")]
[Authorize(Roles = "EVMStaff,DealerManager,DealerStaff")]
public sealed class CancelPurchaseOrderController : ControllerBase
{
    private readonly IMediator _mediator;

    public CancelPurchaseOrderController(IMediator mediator) => _mediator = mediator;

    [HttpPatch("{id:long}/cancel")]
    public async Task<ActionResult<Result>> Cancel(
        [FromRoute] long id,
        CancellationToken ct)
    {
        var command = new CancelPurchaseOrderCommand
        {
            PoId = id,
            // DealerId sẽ được xử lý trong Handler dựa trên role
            DealerId = 0 // Placeholder, sẽ được override trong Handler
        };

        var result = await _mediator.Send(command, ct);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}

