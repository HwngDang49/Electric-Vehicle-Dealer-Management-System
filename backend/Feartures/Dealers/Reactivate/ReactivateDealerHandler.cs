using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Reactivate
{
    public class ReactivateDealerHandler : IRequestHandler<ReactivateDealerCommand, Result<ReactivateDealerResponse>>
    {
        private readonly EVDmsDbContext _db;

        public ReactivateDealerHandler(EVDmsDbContext db) => _db = db;

        public async Task<Result<ReactivateDealerResponse>> Handle(ReactivateDealerCommand request, CancellationToken ct)
        {
            var dealer = await _db.Dealers
                .FirstOrDefaultAsync(d => d.DealerId == request.DealerId, ct);

            if (dealer is null) return Result.NotFound($"Dealer {request.DealerId} not found.");

            var current = Enum.Parse<DealerStatus>(dealer.Status);

            if (current == DealerStatus.Live)
            {
                return Result.Error("Dealer is already in Live status.");
            }

            if (!DealerStatusRules.CanTransit(current, DealerStatus.Live))
                return Result.Error($"Cannot transit {current} → {DealerStatus.Live}.");

            // ✅ Validate prerequisites when transitioning from Onboarding to Live
            if (current == DealerStatus.Onboarding)
            {
                // 1. Check at least 1 Active branch
                var activeBranches = await _db.Branches
                    .Where(b => b.DealerId == dealer.DealerId && b.Status == BranchStatus.Active.ToString())
                    .CountAsync(ct);

                if (activeBranches == 0)
                {
                    return Result.Error("Không thể chuyển dealer sang trạng thái Live. Dealer phải có ít nhất 1 branch ở trạng thái Active.");
                }

                // 2. Check at least 1 Active dealer agreement
                var activeAgreements = await _db.DealerAgreements
                    .Where(a => a.DealerId == dealer.DealerId && a.Status == "Active")
                    .CountAsync(ct);

                if (activeAgreements == 0)
                {
                    return Result.Error("Không thể chuyển dealer sang trạng thái Live. Dealer phải có ít nhất 1 dealer agreement ở trạng thái Active.");
                }

                // 3. Check at least 1 Active DealerManager user
                var activeManagers = await _db.Users
                    .Where(u => u.DealerId == dealer.DealerId 
                             && u.Role == Role.DealerManager.ToString() 
                             && u.Status == UserStatus.Active.ToString())
                    .CountAsync(ct);

                if (activeManagers == 0)
                {
                    return Result.Error("Không thể chuyển dealer sang trạng thái Live. Dealer phải có ít nhất 1 user (DealerManager) ở trạng thái Active.");
                }
            }

            dealer.Status = DealerStatus.Live.ToString();
            dealer.UpdatedAt = DateTime.UtcNow;

            // ✅ Don't call SaveChangesAsync here - TransactionBehavior will handle it
            // await _db.SaveChangesAsync(ct);

            var response = new ReactivateDealerResponse
            {
                DealerId = dealer.DealerId,
                LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
            };

            return Result.Success(response);
        }

    }
}
