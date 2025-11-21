using backend.Common.Auth;
using backend.Common.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Users.Logout
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class LogoutController : ControllerBase
    {
        private readonly SessionManagementService _sessionManagementService;

        public LogoutController(SessionManagementService sessionManagementService)
        {
            _sessionManagementService = sessionManagementService;
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            var userId = User.GetUserId();
            if (userId.HasValue)
            {
                // Xóa session khỏi memory
                _sessionManagementService.RemoveSession(userId.Value);
            }

            return Ok(new { message = "Đăng xuất thành công." });
        }
    }
}

