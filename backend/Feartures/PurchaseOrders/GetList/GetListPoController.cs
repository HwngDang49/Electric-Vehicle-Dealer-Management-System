using Ardalis.Result;
using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.PurchaseOrders.GetList
{
    [ApiController]
    [Route("api/purchase-orders")]
    [Authorize]
    public class GetListPoController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetListPoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetListPo(CancellationToken ct)
        {
            var userId = User.GetUserId();
            var dealerId = User.GetDealerId();

            if (dealerId == null)
                return BadRequest(new { error = "User must belong to a dealer" });

            var query = new GetListPoQuery(dealerId, userId ?? 0);

            var result = await _mediator.Send(query, ct);

            if (result.IsSuccess && userId != 0)
            {
                return Ok(result.Value);
            }
            else
            {
                return BadRequest(result.Errors);
            }
        }
    }
}

