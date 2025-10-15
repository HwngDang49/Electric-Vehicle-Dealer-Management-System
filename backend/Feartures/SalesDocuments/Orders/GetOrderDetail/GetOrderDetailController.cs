using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.GetOrderDetail;

[ApiController]
[Route("api/orders")]
[Authorize]
public sealed class GetOrderDetailController : ControllerBase
{
    private readonly IMediator _mediator;
    public GetOrderDetailController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Lấy chi tiết một đơn hàng.
    /// </summary>
    [HttpGet("{id:long}")]
    public async Task<ActionResult<Result<GetOrderDetailDto>>> GetOrderDetail(
        [FromRoute] long id,
        CancellationToken ct)
    {
        var query = new GetOrderDetailQuery { OrderId = id };
        var result = await _mediator.Send(query, ct);

        if (result.IsSuccess == false)
        {
            return NotFound(result);
        }

        return Ok(result);
    }
}