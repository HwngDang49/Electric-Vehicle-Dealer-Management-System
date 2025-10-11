using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Users.GetUser
{
    [ApiController]
    [Route("api/users")]
    public class GetUserByIdController : ControllerBase
    {
        private readonly IMediator _mediator;
        public GetUserByIdController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{userId:long}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Handle(long userId)
        {
            var result = await _mediator.Send(new GetUserByIdQuery(userId));
            if (result.IsSuccess)
                return Ok(result.Value);
            else if (result.Status == Ardalis.Result.ResultStatus.NotFound)
                return NotFound(result.Errors);
            else
                return BadRequest(result.Errors);
        }
    }
}
