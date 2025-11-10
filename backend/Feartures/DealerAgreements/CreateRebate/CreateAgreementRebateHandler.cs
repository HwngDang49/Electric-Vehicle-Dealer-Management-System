using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.DealerAgreements.CreateRebate
{
    public sealed class CreateAgreementRebateHandler : IRequestHandler<CreateAgreementRebateCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreateAgreementRebateHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<long>> Handle(CreateAgreementRebateCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();

            // 1. Validate Agreement exists
            var agreement = await _db.DealerAgreements
                .FirstOrDefaultAsync(a => a.AgreementId == cmd.AgreementId, ct);

            if (agreement == null)
                return Result.NotFound($"Agreement {cmd.AgreementId} not found.");

            // 2. Permission: Admin hoặc Dealer owner
            if (userRole != Role.Admin.ToString())
            {
                var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
                if (agreement.DealerId != dealerId)
                {
                    return Result.Forbidden("Chỉ Admin hoặc Dealer owner mới được thêm rebate tier.");
                }
            }

            // 3. Validate: Unique (AgreementId, Period, TierQty)
            var duplicate = await _db.AgreementRebates
                .AsNoTracking()
                .AnyAsync(r => r.AgreementId == cmd.AgreementId
                               && r.Period == req.Period
                               && r.TierQty == req.TierQty, ct);

            if (duplicate)
            {
                return Result.Error(
                    $"Đã tồn tại rebate tier cho Agreement {cmd.AgreementId}, Period '{req.Period}', TierQty {req.TierQty}."
                );
            }

            // 4. Create AgreementRebate
            var newRebate = new AgreementRebate
            {
                AgreementId = cmd.AgreementId,
                Period = req.Period,
                TierQty = req.TierQty,
                RebatePerUnit = req.RebatePerUnit,
                CapAmount = req.CapAmount,
                CreatedAt = DateTime.UtcNow
            };

            _db.AgreementRebates.Add(newRebate);
            // Also update Agreement.UpdatedAt when rebate is created
            agreement.UpdatedAt = DateTimeHelper.UtcNow();
            await _db.SaveChangesAsync(ct);

            return Result.Success(newRebate.RebateId);
        }
    }
}

