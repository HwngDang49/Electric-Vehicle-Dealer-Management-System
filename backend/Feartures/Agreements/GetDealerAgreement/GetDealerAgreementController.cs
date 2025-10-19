using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Agreements.GetDealerAgreement
{
    [ApiController]
    [Route("api/agreements")]
    [Authorize]
    public sealed class GetDealerAgreementController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetDealerAgreementController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("my-agreement")]
        public async Task<ActionResult<Result<GetDealerAgreementQuery>>> GetMyAgreement(
            CancellationToken ct)
        {
            var result = await _mediator.Send(new GetDealerAgreementCommand(), ct);

            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            return Ok(result.Value);
        }
    }
}
