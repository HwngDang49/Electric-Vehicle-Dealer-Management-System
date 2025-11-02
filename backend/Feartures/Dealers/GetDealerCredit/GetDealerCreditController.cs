using Ardalis.Result;
using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Dealers.GetDealerCredit
{
    [ApiController]
    [Route("api/dealers")]
    [Authorize]
    public class GetDealerCreditController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetDealerCreditController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get current dealer's credit information from token
        /// Must be defined BEFORE the parameterized route to avoid route conflicts
        /// </summary>
        [HttpGet("me/credit")]
        public async Task<IActionResult> GetMyDealerCredit(CancellationToken ct = default)
        {
            try
            {
                var dealerId = User.GetDealerId();
                var query = new GetDealerCreditQuery(dealerId);
                var result = await _mediator.Send(query, ct);

                if (result.IsSuccess)
                {
                    return Ok(result.Value);
                }
                else
                {
                    return BadRequest(result.Errors);
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get dealer credit information by dealer ID
        /// </summary>
        [HttpGet("{dealerId}/credit")]
        public async Task<IActionResult> GetDealerCredit(
            long dealerId,
            CancellationToken ct = default)
        {
            try
            {
                var query = new GetDealerCreditQuery(dealerId);
                var result = await _mediator.Send(query, ct);

                if (result.IsSuccess)
                {
                    return Ok(result.Value);
                }
                else
                {
                    return BadRequest(result.Errors);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
