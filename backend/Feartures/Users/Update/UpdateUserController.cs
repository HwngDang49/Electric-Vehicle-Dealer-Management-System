using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Users.Update
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UpdateUserController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UpdateUserController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPut("{userId:long}")]
        public async Task<IActionResult> Update(long userId, [FromBody] UpdateUserRequest request, CancellationToken ct)
        {
            var result = await _mediator.Send(new UpdateUserCommand(userId, request), ct);
            
            if (result.IsSuccess)
                return Ok(result.Value);
            else if (result.Status == ResultStatus.NotFound)
                return NotFound(result.Errors);
            else
                return BadRequest(result.Errors);
        }
    }
}

