using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Claims.RejectClaim
{
    public sealed class RejectClaimHandler : IRequestHandler<RejectClaimCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public RejectClaimHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result> Handle(RejectClaimCommand cmd, CancellationToken ct)
        {
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();

            // Permission: Chỉ Admin và EVM Staff mới được reject claims
            if (userRole != Role.Admin.ToString() && userRole != Role.EVMStaff.ToString())
            {
                return Result.Forbidden("Chỉ Admin hoặc EVM Staff mới được reject rebate claims.");
            }

            // 1. Find claim
            var claim = await _db.Claims
                .Include(c => c.Dealer)
                .Include(c => c.Agreement)
                .FirstOrDefaultAsync(c => c.ClaimId == cmd.ClaimId, ct);

            if (claim == null)
                return Result.NotFound($"Claim {cmd.ClaimId} not found.");

            // 2. Validate: Chỉ có thể reject claims có Status = "Pending"
            if (claim.Status != "Pending")
            {
                return Result.Error($"Không thể reject claim có Status '{claim.Status}'. Chỉ có thể reject claims đang ở trạng thái 'Pending'.");
            }

            // 3. Update claim status
            claim.Status = "Rejected";
            claim.ResolvedAt = DateTime.UtcNow;

            // Note: Có thể lưu reason vào một field khác nếu cần (hiện tại Claim entity chưa có Reason field)

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}

