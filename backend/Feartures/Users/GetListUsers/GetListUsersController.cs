using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Users.GetListUsers
{
    [ApiController]
    [Route("api/users")]
    public class GetListUsersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetListUsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var result = await _mediator.Send(new GetListUsersQuery());
            
            if (result.IsSuccess)
                return Ok(result.Value);
            
            return BadRequest(result.Errors);
        }
    }
}

