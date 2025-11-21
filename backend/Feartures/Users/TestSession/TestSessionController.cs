using backend.Common.Auth;
using backend.Common.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Users.TestSession
{
    /// <summary>
    /// Test Controller để kiểm tra tính năng "1 account chỉ online 1 chỗ"
    /// Chỉ dùng trong Development environment
    /// </summary>
    [ApiController]
    [Route("api/test/session")]
    public class TestSessionController : ControllerBase
    {
        private readonly SessionManagementService _sessionManagementService;

        public TestSessionController(SessionManagementService sessionManagementService)
        {
            _sessionManagementService = sessionManagementService;
        }

        /// <summary>
        /// Kiểm tra session hiện tại của user đang đăng nhập
        /// </summary>
        [HttpGet("check-my-session")]
        [Authorize]
        public IActionResult CheckMySession()
        {
            var userId = User.GetUserId();
            if (!userId.HasValue)
            {
                return Unauthorized("User ID not found in token.");
            }

            var token = ExtractTokenFromHeader();
            var isValid = _sessionManagementService.IsValidSession(userId.Value, token ?? "");
            var activeSession = _sessionManagementService.GetActiveSession(userId.Value);

            return Ok(new
            {
                userId = userId.Value,
                currentToken = token,
                activeSessionInMemory = activeSession,
                isValid = isValid,
                isTokenMatch = token == activeSession,
                message = isValid 
                    ? "✅ Session hợp lệ - Token của bạn là session hiện tại" 
                    : "❌ Session không hợp lệ - Token của bạn không phải session hiện tại (có thể đã login ở chỗ khác)"
            });
        }

        /// <summary>
        /// Lấy thông tin tất cả sessions đang active (chỉ để test)
        /// </summary>
        [HttpGet("all-sessions")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetAllSessions()
        {
            // Note: Trong thực tế, không nên expose method này
            // Chỉ dùng để test/debug
            var allSessions = _sessionManagementService.GetAllActiveSessions();
            var onlineCount = _sessionManagementService.GetOnlineUserCount();
            
            return Ok(new
            {
                onlineUserCount = onlineCount,
                activeSessions = allSessions.Select(kvp => new
                {
                    userId = kvp.Key,
                    tokenPreview = kvp.Value.Length > 30 
                        ? kvp.Value.Substring(0, 30) + "..." 
                        : kvp.Value
                }).ToList(),
                message = $"Hiện có {onlineCount} user(s) đang online"
            });
        }

        /// <summary>
        /// Test: Simulate login mới (chỉ để test, không thực sự login)
        /// </summary>
        [HttpPost("simulate-login/{userId}")]
        [Authorize(Roles = "Admin")]
        public IActionResult SimulateLogin(long userId, [FromBody] string testToken)
        {
            var oldToken = _sessionManagementService.SetActiveSession(userId, testToken);
            var isValid = _sessionManagementService.IsValidSession(userId, testToken);

            return Ok(new
            {
                userId = userId,
                newToken = testToken,
                oldToken = oldToken,
                isValid = isValid,
                message = oldToken != null 
                    ? $"✅ Đã tạo session mới. Session cũ: {oldToken.Substring(0, Math.Min(20, oldToken.Length))}..." 
                    : "✅ Đã tạo session mới (không có session cũ)"
            });
        }

        /// <summary>
        /// Test: Xóa session của user (chỉ để test)
        /// </summary>
        [HttpDelete("remove-session/{userId}")]
        [Authorize(Roles = "Admin")]
        public IActionResult RemoveSession(long userId)
        {
            var hadSession = _sessionManagementService.IsUserOnline(userId);
            _sessionManagementService.RemoveSession(userId);
            var hasSessionAfter = _sessionManagementService.IsUserOnline(userId);

            return Ok(new
            {
                userId = userId,
                hadSessionBefore = hadSession,
                hasSessionAfter = hasSessionAfter,
                message = hadSession 
                    ? "✅ Đã xóa session thành công" 
                    : "⚠️ User này không có session nào để xóa"
            });
        }

        private string? ExtractTokenFromHeader()
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            return authHeader.Substring("Bearer ".Length).Trim();
        }
    }
}

