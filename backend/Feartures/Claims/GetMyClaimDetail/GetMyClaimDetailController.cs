using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Claims.GetMyClaimDetail
{
    [ApiController]
    [Route("api/my-claims")]
    [Authorize]
    public class GetMyClaimDetailController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetMyClaimDetailController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// DealerManager/DealerStaff xem chi tiết claim của chính dealer mình
        /// </summary>
        [HttpGet("{id:long}", Name = "GetMyClaimDetail")]
        public async Task<IActionResult> GetMyClaimDetail([FromRoute] long id, CancellationToken ct)
        {
            var query = new GetMyClaimDetailQuery { ClaimId = id };
            var result = await _mediator.Send(query, ct);

            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }

            if (result.Status == ResultStatus.NotFound)
            {
                return NotFound(result);
            }

            if (result.Status == ResultStatus.Forbidden)
            {
                return StatusCode(403, result);
            }

            return BadRequest(result);
        }
    }
}

