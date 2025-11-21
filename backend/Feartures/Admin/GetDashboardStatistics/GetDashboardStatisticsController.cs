using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Admin.GetDashboardStatistics;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin")]
public sealed class GetDashboardStatisticsController : ControllerBase
{
    private readonly IMediator _mediator;

    public GetDashboardStatisticsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Lấy thống kê dashboard cho Admin (số dealer, branch, user, product đang hoạt động)
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<GetDashboardStatisticsResponse>> GetDashboardStatistics(
        CancellationToken ct)
    {
        var query = new GetDashboardStatisticsQuery();
        var result = await _mediator.Send(query, ct);
        return Ok(result);
    }
}

