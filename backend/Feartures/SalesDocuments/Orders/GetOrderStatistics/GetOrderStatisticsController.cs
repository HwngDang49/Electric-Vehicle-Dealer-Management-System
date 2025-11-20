using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.GetOrderStatistics;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public sealed class GetOrderStatisticsController : ControllerBase
{
    private readonly IMediator _mediator;

    public GetOrderStatisticsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Lấy thống kê order theo dealer theo tháng hoặc quý (Admin only)
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<GetOrderStatisticsResponse>> GetOrderStatistics(
        [FromQuery] GetOrderStatisticsQuery query,
        CancellationToken ct)
    {
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }
}

