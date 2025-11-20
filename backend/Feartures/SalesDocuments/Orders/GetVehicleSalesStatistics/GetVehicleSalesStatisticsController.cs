using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.GetVehicleSalesStatistics;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public sealed class GetVehicleSalesStatisticsController : ControllerBase
{
    private readonly IMediator _mediator;

    public GetVehicleSalesStatisticsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Lấy thống kê số lượng xe bán ra theo mẫu xe cho tháng hiện tại (Admin only)
    /// </summary>
    [HttpGet("vehicle-sales-statistics")]
    public async Task<ActionResult<GetVehicleSalesStatisticsResponse>> GetVehicleSalesStatistics(
        CancellationToken ct)
    {
        var query = new GetVehicleSalesStatisticsQuery();
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }
}

