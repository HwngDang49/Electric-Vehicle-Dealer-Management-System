using backend.Common.Paging;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Rebates.GetSettlements
{
    [ApiController]
    [Route("api/rebates")]
    [Authorize]
    public class GetRebateSettlementsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetRebateSettlementsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("settlements")]
        public async Task<IActionResult> GetSettlements(
            [FromQuery] long? agreementId,
            [FromQuery] string? period,
            [FromQuery] string? claimStatus,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var query = new GetRebateSettlementsQuery
            {
                AgreementId = agreementId,
                Period = period,
                ClaimStatus = claimStatus,
                Page = page,
                PageSize = pageSize
            };

            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }
    }
}

