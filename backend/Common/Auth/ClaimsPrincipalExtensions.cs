using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace backend.Common.Auth
{
    public static class ClaimsPrincipalExtensions
    {
        // ĐỔI tên claim nếu JWT của bạn đặt khác (vd: "dealerId")
        private const string DealerIdClaim = "dealer_id";

        /// <summary>
        /// Lấy DealerId từ JWT. Ném UnauthorizedAccessException nếu thiếu/sai.
        /// </summary>
        public static long GetDealerId(this ClaimsPrincipal user)
        {
            if (user?.Identity?.IsAuthenticated != true)
                throw new UnauthorizedAccessException("User is not authenticated.");

            var raw = user.FindFirstValue(DealerIdClaim);
            if (string.IsNullOrWhiteSpace(raw))
                throw new UnauthorizedAccessException("Dealer context is missing.");

            if (!long.TryParse(raw, out var dealerId) || dealerId <= 0)
                throw new UnauthorizedAccessException("Invalid dealer id in token.");

            return dealerId;
        }

        public static long? GetUserId(this ClaimsPrincipal user)
        {
            var raw = user.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? user.FindFirstValue(JwtRegisteredClaimNames.Sub);
            return long.TryParse(raw, out var id) ? id : null;
        }


        public static string? GetRole(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.Role)          // "role" theo chuẩn
                ?? user.FindFirstValue("role")                   // JWT tùy hệ thống
                ?? user.FindFirstValue("roles");                 // đôi khi dùng "roles" (1 giá trị)
        }

        /// <summary>
        /// Lấy BranchId từ JWT. Trả về null nếu không có hoặc user không authenticated.
        /// </summary>
        public static long? GetBranchId(this ClaimsPrincipal user)
        {
            if (user?.Identity?.IsAuthenticated != true)
                return null;

            var raw = user.FindFirstValue("branch_id");
            if (string.IsNullOrWhiteSpace(raw))
                return null;

            if (long.TryParse(raw, out var branchId) && branchId > 0)
                return branchId;

            return null;
        }
    }
}
