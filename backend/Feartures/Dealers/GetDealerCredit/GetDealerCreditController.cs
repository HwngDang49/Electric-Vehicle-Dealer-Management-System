using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Dealers.GetDealerCredit
{
    [ApiController]
    [Route("api/dealers")]
    public class GetDealerCreditController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetDealerCreditController(IMediator mediator)
        {
            _mediator = mediator;
        }

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
