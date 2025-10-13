using Ardalis.Result;
using backend.Common.Auth;     // User.GetDealerId()
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Quotes.ConvertToOrder;

[ApiController]
[Route("api/quotes")]
[Authorize]
public sealed class ConvertToOrderController : ControllerBase
{
    private readonly IMediator _mediator;
    public ConvertToOrderController(IMediator mediator) => _mediator = mediator;

    // PATCH /api/quotes/{id}/convert-to-order
    [HttpPatch("{id:long}/convert-to-order")]
    public async Task<ActionResult<Result<long>>> Convert([FromRoute] long id, CancellationToken ct)
    {
        var cmd = new ConvertToOrderCommand { SalesDocId = id, DealerId = User.GetDealerId() };
        var res = await _mediator.Send(cmd, ct);
        if (!res.IsSuccess) return BadRequest(res);     // ErrorHandlingMiddleware sẽ lo exceptions
        return Ok(res);  // data = orderId
    }
}
