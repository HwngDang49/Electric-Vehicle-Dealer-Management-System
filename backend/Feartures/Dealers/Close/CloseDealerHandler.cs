using Ardalis.Result;
using backend.Common.Helpers;
using backend.Common.Services;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Close
{
    public class CloseDealerHandler : IRequestHandler<CloseDealerCommand, Result<CloseDealerResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly DealerStatusChangeService _dealerStatusChangeService;

        public CloseDealerHandler(EVDmsDbContext db, DealerStatusChangeService dealerStatusChangeService)
        {
            _db = db;
            _dealerStatusChangeService = dealerStatusChangeService;
        }

        public async Task<Result<CloseDealerResponse>> Handle(CloseDealerCommand command, CancellationToken ct)
        {
            var dealer = await _db.Dealers
                .FirstOrDefaultAsync(d => d.DealerId == command.DealerId, ct);

            if (dealer is null)
            {
                return Result.NotFound($"Dealer {command.DealerId} not found.");
            }

            var current = Enum.Parse<DealerStatus>(dealer.Status);

            if (current == DealerStatus.Closed)
            {
                return Result.Success(new CloseDealerResponse
                {
                    DealerId = dealer.DealerId,
                    LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
                });
            }

            if (!DealerStatusRules.CanTransit(current, DealerStatus.Closed))
            {
                return Result.Error($"Cannot transit {current} → {DealerStatus.Closed}.");
            }

            // ✅ Validate: All branches must be closed before closing dealer
            var nonClosedBranches = await _db.Branches
                .Where(b => b.DealerId == dealer.DealerId && b.Status != BranchStatus.Closed.ToString())
                .Select(b => new { b.BranchId, b.Code, b.Status })
                .ToListAsync(ct);

            if (nonClosedBranches.Any())
            {
                var branchDetails = string.Join(", ", nonClosedBranches.Select(b => $"{b.Code} ({b.Status})"));
                return Result.Error($"Cannot close dealer. All branches must be closed first. " +
                    $"Found {nonClosedBranches.Count} branch(es) that are not closed: {branchDetails}. " +
                    $"Please close all branches before closing the dealer.");
            }

            dealer.Status = DealerStatus.Closed.ToString();
            dealer.UpdatedAt = DateTime.UtcNow;

            // Handle cascade effects: deactivate users, promotions, pricebooks, expire agreements
            // Note: Branches are already closed (validated above), so no need to close them again
            await _dealerStatusChangeService.HandleDealerClose(dealer.DealerId, ct);

            // ✅ Don't call SaveChangesAsync here - TransactionBehavior will handle it
            // await _db.SaveChangesAsync(ct);

            var response = new CloseDealerResponse
            {
                DealerId = dealer.DealerId,
                LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
            };
            return Result.Success(response);
        }

    }
}
