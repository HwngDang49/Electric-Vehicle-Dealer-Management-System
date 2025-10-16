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

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] UserLoginRequest request)
        {
            var result = await _mediator.Send(new UserLoginCommand(request));
            if (result.IsSuccess)
                return Ok(result.Value);
            else
                return Unauthorized(result.Errors);
        }


        [HttpPost("Login-jwt")]
        public async Task<IActionResult> LoginJwdt([FromBody] UserLoginRequest request)
        {
            var result = await _mediator.Send(new UserLoginJwtCommand(request));
            if (result.IsSuccess) return Ok(result.Value);

            return Unauthorized(result.Errors);

        }
    }
}
