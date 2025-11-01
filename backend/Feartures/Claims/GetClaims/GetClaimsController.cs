using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Claims.GetClaims
{
    [ApiController]
    [Route("api/claims")]
    [Authorize]
    public class GetClaimsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetClaimsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetClaims(
            [FromQuery] long? dealerId,
            [FromQuery] long? agreementId,
            [FromQuery] string? period,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var query = new GetClaimsQuery
            {
                DealerId = dealerId,
                AgreementId = agreementId,
                Period = period,
                Status = status,
                Page = page,
                PageSize = pageSize
            };

            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }
    }
}

