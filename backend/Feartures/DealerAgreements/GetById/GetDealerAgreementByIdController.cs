using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.DealerAgreements.GetById
{
    [ApiController]
    [Route("api/dealer-agreements")]
    [Authorize]
    public class GetDealerAgreementByIdController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetDealerAgreementByIdController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{agreementId:long}")]
        public async Task<IActionResult> GetById(long agreementId, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetDealerAgreementByIdQuery(agreementId), ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound)
                    return NotFound(result);
                return BadRequest(result);
            }

            return Ok(result.Value);
        }
    }
}

