using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.DealerAgreements.Create
{
    [ApiController]
    [Route("api/dealer-agreements")]
    [Authorize]
    public class CreateDealerAgreementController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreateDealerAgreementController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDealerAgreementRequest request, CancellationToken ct)
        {
            var result = await _mediator.Send(new CreateDealerAgreementCommand(request), ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound)
                    return NotFound(result);
                return BadRequest(result);
            }

            return Ok(new { agreement_id = result.Value });
        }
    }
}

