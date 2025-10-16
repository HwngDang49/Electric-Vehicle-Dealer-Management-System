using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Feartures.Users.GetCurrentUser;

namespace Backend.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly ISender _mediator; // ISender là interface của MediatR

    public UsersController(ISender mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("me")] // "me" là một convention phổ biến để lấy thông tin user hiện tại
    [Authorize] // Rất quan trọng! Chỉ user đã đăng nhập mới gọi được
    public async Task<IActionResult> GetCurrentUser()
    {
        var query = new GetCurrentUserQuery();
        var result = await _mediator.Send(query);

        return Ok(result);
    }
}