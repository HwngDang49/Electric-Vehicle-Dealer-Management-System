using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.CreateOrder;

[ApiController]
[Route("api/orders")]
[Authorize]
public sealed class CreateOrderController : ControllerBase
{
    private readonly IMediator _mediator;
    public CreateOrderController(IMediator mediator) => _mediator = mediator;

    /// <summary>
    /// Tạo một Đơn hàng mới trực tiếp.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Result<CreateOrderResponse>>> HandleAsync(
        [FromBody] CreateOrderCommand body,
        CancellationToken ct)
    {
        var result = await _mediator.Send(body, ct);

        if (!result.IsSuccess)
        {
            if (result.Status == ResultStatus.NotFound) return NotFound(result);
            return BadRequest(result);
        }

        var locationUrl = $"/api/orders/{result.Value.OrderId}";
        return Created(locationUrl, result);
    }
}