using Ardalis.Result;
using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.CancelOrder;

[ApiController]
[Route("api/orders")]
[Authorize]
public sealed class CancelOrderController : ControllerBase
{
    private readonly IMediator _mediator;
    public CancelOrderController(IMediator mediator) => _mediator = mediator;

    [HttpPatch("{id:long}/cancel")]
    public async Task<ActionResult<Result>> Cancel(
        [FromRoute] long id,
        [FromBody] CancelOrderCommand command,
        CancellationToken ct)
    {
        command.OrderId = id;
        command.DealerId = User.GetDealerId();

        var result = await _mediator.Send(command, ct);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}

