using Ardalis.Result;
using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;

namespace backend.Feartures.Orders.CloseOrder
{
    [ApiController]
    [Route("api/close-order")]
    [Authorize]
    public class CloseOrderController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CloseOrderController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Close([FromBody] CloseOrderRequest req, CancellationToken ct)
        {
            var userId = User.GetUserId() ?? 0;
            var result = await _mediator.Send(new CloseOrderCommand(req, userId));
            if (result.IsSuccess)
                return Ok(new { message = "Order closed successfully" });
            return BadRequest(new { errors = result.Errors });
        }
    }
}
