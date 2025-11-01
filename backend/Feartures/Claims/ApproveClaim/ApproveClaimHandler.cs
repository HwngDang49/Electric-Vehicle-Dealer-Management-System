using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Claims.ApproveClaim
{
    public sealed class ApproveClaimHandler : IRequestHandler<ApproveClaimCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ApproveClaimHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result> Handle(ApproveClaimCommand cmd, CancellationToken ct)
        {
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();

            // Permission: Chỉ Admin và EVM Staff mới được approve claims
            if (userRole != Role.Admin.ToString() && userRole != Role.EVMStaff.ToString())
            {
                return Result.Forbidden("Chỉ Admin hoặc EVM Staff mới được approve rebate claims.");
            }

            // 1. Find claim
            var claim = await _db.Claims
                .Include(c => c.Dealer)
                .Include(c => c.Agreement)
                .FirstOrDefaultAsync(c => c.ClaimId == cmd.ClaimId, ct);

            if (claim == null)
                return Result.NotFound($"Claim {cmd.ClaimId} not found.");

            // 2. Validate: Chỉ có thể approve claims có Status = "Pending"
            if (claim.Status != "Pending")
            {
                return Result.Error($"Không thể approve claim có Status '{claim.Status}'. Chỉ có thể approve claims đang ở trạng thái 'Pending'.");
            }

            // 3. Update claim status
            claim.Status = "Approved";
            claim.ResolvedAt = DateTime.UtcNow;

            //// 4. Tạo Settlement (thanh toán rebate)
            //var settlement = new backend.Domain.Entities.Settlement
            //{
            //    ClaimId = claim.ClaimId,
            //    PaidAmount = claim.Amount,
            //    PaidAt = DateTime.UtcNow,
            //    ReferenceNo = $"REBATE-{claim.ClaimId}-{DateTime.UtcNow:yyyyMMdd}"
            //};

            //_db.Settlements.Add(settlement);
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}

