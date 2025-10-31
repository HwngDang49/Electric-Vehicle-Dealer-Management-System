using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.DealerAgreements.GetRebates
{
    [ApiController]
    [Route("api/dealer-agreements")]
    [Authorize]
    public class GetListAgreementRebatesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetListAgreementRebatesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{agreementId:long}/rebates")]
        public async Task<IActionResult> GetList(
            long agreementId,
            [FromQuery] string? period,
            CancellationToken ct)
        {
            var query = new GetListAgreementRebatesQuery
            {
                AgreementId = agreementId,
                Period = period
            };

            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }
    }
}

