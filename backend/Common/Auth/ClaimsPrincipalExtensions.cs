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

    }
}
