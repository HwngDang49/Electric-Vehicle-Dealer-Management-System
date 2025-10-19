using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace backend;

[ApiController]
[Route("api/test")]
[AllowAnonymous]
public class TestController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Test endpoint working!");
    }
    
    [HttpPatch("{id}/send")]
    public IActionResult Send(int id)
    {
        return Ok($"Send endpoint working for ID: {id}");
    }
}
