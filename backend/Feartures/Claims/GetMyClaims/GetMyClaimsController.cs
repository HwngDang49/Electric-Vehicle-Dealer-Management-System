using backend.Common.Paging;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Claims.GetMyClaims
{
    [ApiController]
    [Route("api/my-claims")]
    [Authorize]
    public class GetMyClaimsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetMyClaimsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// DealerManager/DealerStaff xem claims của chính dealer mình
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMyClaims(
            [FromQuery] long? agreementId,
            [FromQuery] string? period,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var query = new GetMyClaimsQuery
            {
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

