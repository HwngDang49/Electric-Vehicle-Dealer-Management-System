using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.DealerAgreements.UpdateRebate
{
    public sealed class UpdateAgreementRebateHandler : IRequestHandler<UpdateAgreementRebateCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateAgreementRebateHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result> Handle(UpdateAgreementRebateCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();

            // 1. Find rebate
            var rebate = await _db.AgreementRebates
                .Include(r => r.Agreement)
                .FirstOrDefaultAsync(r => r.RebateId == cmd.RebateId
                                          && r.AgreementId == cmd.AgreementId, ct);

            if (rebate == null)
                return Result.NotFound($"Rebate {cmd.RebateId} not found for Agreement {cmd.AgreementId}.");

            // 2. Permission: Admin hoặc Dealer owner
            if (userRole != Role.Admin.ToString())
            {
                var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
                if (rebate.Agreement.DealerId != dealerId)
                {
                    return Result.Forbidden("Chỉ Admin hoặc Dealer owner mới được cập nhật rebate tier.");
                }
            }

            // 3. CRITICAL: Kiểm tra Period đã được tính rebate chưa (có Claim với AgreementId + Period)
            var hasCalculatedClaim = await _db.Claims
                .AsNoTracking()
                .AnyAsync(c => c.AgreementId == cmd.AgreementId
                               && c.Period == rebate.Period
                               && c.AgreementId != null
                               && c.Period != null, ct);

            if (hasCalculatedClaim)
            {
                return Result.Error(
                    $"Không thể cập nhật rebate tier vì Period '{rebate.Period}' đã được tính rebate (đã có Claim). " +
                    "Để đảm bảo tính nhất quán, chỉ có thể chỉnh sửa rebate tier trước khi tính rebate."
                );
            }

            // 4. Validate: Nếu đổi TierQty → check duplicate (AgreementId, Period, TierQty mới)
            if (req.TierQty.HasValue && req.TierQty.Value != rebate.TierQty)
            {
                var duplicate = await _db.AgreementRebates
                    .AsNoTracking()
                    .AnyAsync(r => r.AgreementId == cmd.AgreementId
                                   && r.Period == rebate.Period
                                   && r.TierQty == req.TierQty.Value
                                   && r.RebateId != cmd.RebateId, ct);

                if (duplicate)
                {
                    return Result.Error(
                        $"Đã tồn tại rebate tier cho Agreement {cmd.AgreementId}, Period '{rebate.Period}', TierQty {req.TierQty.Value}."
                    );
                }
            }

            // 5. Update properties
            if (req.TierQty.HasValue)
                rebate.TierQty = req.TierQty.Value;

            if (req.RebatePerUnit.HasValue)
                rebate.RebatePerUnit = req.RebatePerUnit.Value;

            if (req.CapAmount.HasValue)
                rebate.CapAmount = req.CapAmount;

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}

