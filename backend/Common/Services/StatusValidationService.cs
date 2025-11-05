using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Common.Services
{
    /// <summary>
    /// Service for validating Dealer and Branch status for various operations
    /// </summary>
    public class StatusValidationService
    {
        private readonly EVDmsDbContext _db;

        public StatusValidationService(EVDmsDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Validate dealer is Live for retail operations (create order, quote)
        /// </summary>
        public async Task<Result> ValidateDealerForRetail(long dealerId, CancellationToken ct = default)
        {
            var dealer = await _db.Dealers
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DealerId == dealerId, ct);

            if (dealer == null)
                return Result.NotFound($"Dealer {dealerId} not found.");

            if (dealer.Status != DealerStatus.Live.ToString())
                return Result.Error($"Dealer must be in 'Live' status to perform retail operations. Current status: {dealer.Status}");

            return Result.Success();
        }

        /// <summary>
        /// Validate branch is Active for retail operations (create order, quote)
        /// </summary>
        public async Task<Result> ValidateBranchForRetail(long branchId, CancellationToken ct = default)
        {
            var branch = await _db.Branches
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.BranchId == branchId, ct);

            if (branch == null)
                return Result.NotFound($"Branch {branchId} not found.");

            if (branch.Status != BranchStatus.Active.ToString())
                return Result.Error($"Branch must be in 'Active' status to perform retail operations. Current status: {branch.Status}");

            return Result.Success();
        }

        /// <summary>
        /// Validate dealer is Live or Onboarding for configuration operations (create pricebook, promotion, agreement, user)
        /// </summary>
        public async Task<Result> ValidateDealerForConfig(long dealerId, bool allowOnboarding = false, CancellationToken ct = default)
        {
            var dealer = await _db.Dealers
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DealerId == dealerId, ct);

            if (dealer == null)
                return Result.NotFound($"Dealer {dealerId} not found.");

            if (allowOnboarding && dealer.Status == DealerStatus.Onboarding.ToString())
                return Result.Success();

            if (dealer.Status != DealerStatus.Live.ToString())
                return Result.Error($"Dealer must be in 'Live' status {(allowOnboarding ? "or 'Onboarding' status " : "")}to perform configuration operations. Current status: {dealer.Status}");

            return Result.Success();
        }

        /// <summary>
        /// Validate branch is Active for configuration operations (create user)
        /// </summary>
        public async Task<Result> ValidateBranchForConfig(long branchId, CancellationToken ct = default)
        {
            var branch = await _db.Branches
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.BranchId == branchId, ct);

            if (branch == null)
                return Result.NotFound($"Branch {branchId} not found.");

            if (branch.Status != BranchStatus.Active.ToString())
                return Result.Error($"Branch must be in 'Active' status to perform configuration operations. Current status: {branch.Status}");

            return Result.Success();
        }

        /// <summary>
        /// Validate dealer is Live for activation operations (activate pricebook, promotion, agreement)
        /// </summary>
        public async Task<Result> ValidateDealerForActivation(long dealerId, CancellationToken ct = default)
        {
            var dealer = await _db.Dealers
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DealerId == dealerId, ct);

            if (dealer == null)
                return Result.NotFound($"Dealer {dealerId} not found.");

            if (dealer.Status != DealerStatus.Live.ToString())
                return Result.Error($"Dealer must be in 'Live' status to activate resources. Current status: {dealer.Status}");

            return Result.Success();
        }

        /// <summary>
        /// Validate branches in scope are Active for promotion operations
        /// </summary>
        public async Task<Result> ValidateBranchesForPromotion(List<long> branchIds, CancellationToken ct = default)
        {
            if (branchIds == null || !branchIds.Any())
                return Result.Success(); // No branches to validate

            var branches = await _db.Branches
                .AsNoTracking()
                .Where(b => branchIds.Contains(b.BranchId))
                .ToListAsync(ct);

            var missingBranches = branchIds.Except(branches.Select(b => b.BranchId)).ToList();
            if (missingBranches.Any())
                return Result.NotFound($"Branches not found: {string.Join(", ", missingBranches)}");

            var inactiveBranches = branches
                .Where(b => b.Status != BranchStatus.Active.ToString())
                .Select(b => new { b.BranchId, b.Code, b.Status })
                .ToList();

            if (inactiveBranches.Any())
            {
                var details = string.Join(", ", inactiveBranches.Select(b => $"{b.Code} ({b.Status})"));
                return Result.Error($"All branches in promotion scope must be 'Active'. Found inactive: {details}");
            }

            return Result.Success();
        }
    }
}

