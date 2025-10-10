using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Users
{
    [ApiController]
    [Route("api/users")]
    public class CreateUserController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreateUserController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
        {
            var result = await _mediator.Send(new CreateUserCommand(request));
            if (result.IsSuccess)
                return Ok(new { user_id = result.Value });
            else
                return BadRequest(result.Errors);
        }
    }
}
