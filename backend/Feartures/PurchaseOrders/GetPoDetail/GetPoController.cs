using backend.Feartures.PurchaseOrders.GetPo;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace backend.Feartures.PurchaseOrders.GetPoDetail
{
    [ApiController]
    [Route("api/get-po-detail")]
    [Authorize]
    public class GetPoController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetPoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{PoId:long}")]
        public async Task<IActionResult> GetPo(long PoId)
        {
            var result = await _mediator.Send(new GetPoDetailQuery(PoId));

            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return BadRequest();
        }
    }
}
