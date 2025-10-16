using backend.Common.Paging;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.GetOrders;

[ApiController]
[Route("api/orders")]
[Authorize]
public sealed class GetOrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    public GetOrdersController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Lấy danh sách đơn hàng có phân trang và bộ lọc.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<GetOrdersListItemDto>>> GetOrders(
        [FromQuery] GetOrdersQuery query,
        CancellationToken ct)
    {
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }
}