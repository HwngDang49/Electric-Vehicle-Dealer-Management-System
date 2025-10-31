using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Rebates.GetReport
{
    [ApiController]
    [Route("api/rebates")]
    [Authorize]
    public class GetRebateReportController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetRebateReportController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("report")]
        public async Task<IActionResult> GetReport(
            [FromQuery] long? agreementId,
            [FromQuery] string? periodFrom,
            [FromQuery] string? periodTo,
            CancellationToken ct = default)
        {
            var query = new GetRebateReportQuery
            {
                AgreementId = agreementId,
                PeriodFrom = periodFrom,
                PeriodTo = periodTo
            };

            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }
    }
}

