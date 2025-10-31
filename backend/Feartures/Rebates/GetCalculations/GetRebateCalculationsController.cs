using backend.Common.Paging;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Rebates.GetCalculations
{
    [ApiController]
    [Route("api/rebates")]
    [Authorize]
    public class GetRebateCalculationsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetRebateCalculationsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("calculations")]
        public async Task<IActionResult> GetCalculations(
            [FromQuery] long? agreementId,
            [FromQuery] string? period,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var query = new GetRebateCalculationsQuery
            {
                AgreementId = agreementId,
                Period = period,
                Page = page,
                PageSize = pageSize
            };

            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }
    }
}

