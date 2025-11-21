using System.IdentityModel.Tokens.Jwt;
using backend.Common.Auth;
using backend.Common.Services;

namespace backend.Api.Middlewares
{
    /// <summary>
    /// Middleware để validate session token - đảm bảo token là session hiện tại của user
    /// Nếu token không phải session hiện tại, trả về 401 Unauthorized
    /// </summary>
    public class SessionValidationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly SessionManagementService _sessionManagementService;

        public SessionValidationMiddleware(RequestDelegate next, SessionManagementService sessionManagementService)
        {
            _next = next;
            _sessionManagementService = sessionManagementService;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Bỏ qua validation cho các endpoint không cần authentication
            var path = context.Request.Path.Value?.ToLower() ?? "";
            if (path.Contains("/users/login") || 
                path.Contains("/users/refresh-token") ||
                path.Contains("/swagger") ||
                path.StartsWith("/api/health"))
            {
                await _next(context);
                return;
            }

            // Chỉ validate nếu user đã authenticated
            if (context.User?.Identity?.IsAuthenticated == true)
            {
                var userId = context.User.GetUserId();
                if (userId.HasValue)
                {
                    // Lấy token từ header
                    var token = ExtractTokenFromHeader(context);
                    if (!string.IsNullOrEmpty(token))
                    {
                        // Kiểm tra xem token có phải là session hiện tại không
                        if (!_sessionManagementService.IsValidSession(userId.Value, token))
                        {
                            // Session không hợp lệ (có thể đã bị invalidate do login ở chỗ khác)
                            context.Response.StatusCode = 401;
                            context.Response.ContentType = "application/json";
                            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new
                            {
                                error = "Session has been invalidated. Please login again.",
                                message = "Bạn đã đăng nhập ở một thiết bị khác. Vui lòng đăng nhập lại."
                            }));
                            return;
                        }
                    }
                }
            }

            await _next(context);
        }

        private string? ExtractTokenFromHeader(HttpContext context)
        {
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            return authHeader.Substring("Bearer ".Length).Trim();
        }
    }
}

