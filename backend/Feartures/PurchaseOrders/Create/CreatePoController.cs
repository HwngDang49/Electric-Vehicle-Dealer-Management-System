using System.Security.Claims;
using backend.Feartures.Users.GetUser;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.PurchaseOrders.Create
{
    [ApiController]
    [Route("api/create-po")]
    [Authorize(Roles = "DealerStaff,DealerManager")]
    public class CreatePoController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreatePoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePoRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            long value = long.Parse(userId);

            var result = await _mediator.Send(new CreatePoCommand(request, value));

            if (result.IsSuccess)
                return Ok(result.Value);
            return BadRequest(result.Value);
        }
    }
}
