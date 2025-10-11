using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Users.Login
{
    [ApiController]
    [Route("api/users/login")]
    public class UserLoginController : ControllerBase
    {
        private readonly IMediator _mediator;
        public UserLoginController(IMediator mediator)
        {
            _mediator = mediator;
        }


        [HttpPost]
        public async Task<IActionResult> Login([FromBody] UserLoginRequest request)
        {
            var result = await _mediator.Send(new UserLoginCommand(request));
            if (result.IsSuccess)
                return Ok(result.Value);
            else
                return Unauthorized(result.Errors);
        }
    }
}
