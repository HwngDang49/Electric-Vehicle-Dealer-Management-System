using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Claims.GetClaimDetail
{
    [ApiController]
    [Route("api/claims")]
    [Authorize]
    public class GetClaimDetailController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetClaimDetailController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{id:long}", Name = "GetClaimDetail")]
        public async Task<IActionResult> GetClaimDetail([FromRoute] long id, CancellationToken ct)
        {
            var query = new GetClaimDetailQuery { ClaimId = id };
            var result = await _mediator.Send(query, ct);

            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }

            if (result.Status == ResultStatus.NotFound)
            {
                return NotFound(result);
            }

            return BadRequest(result);
        }
    }
}

