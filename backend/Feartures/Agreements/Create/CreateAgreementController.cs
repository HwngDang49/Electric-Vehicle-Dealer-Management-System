using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Agreements.Create
{
    [ApiController]
    [Route("api/admin/agreements")]
    [Authorize]
    public class CreateAgreementController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreateAgreementController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<ActionResult<Result<long>>> CreateAgreement(
            [FromBody] CreateAgreementRequest request,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new CreateAgreementCommand(request), ct);

            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            return Ok(new { agreement_id = result.Value });
        }
    }
}
