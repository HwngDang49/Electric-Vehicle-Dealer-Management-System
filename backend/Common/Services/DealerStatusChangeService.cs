using System;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Common.Services
{
    /// <summary>
    /// Service for handling cascade effects when Dealer status changes
    /// </summary>
    public class DealerStatusChangeService
    {
        private readonly EVDmsDbContext _db;

        public DealerStatusChangeService(EVDmsDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Handle cascade effects when dealer is suspended
        /// - All Active/Inactive branches → Auto suspend
        /// - Users remain Active (branch suspend logic handles this - users can complete existing orders but cannot create new ones)
        /// - Promotions remain Active (validation will block usage when dealer/branch is suspended)
        /// </summary>
        public async Task HandleDealerSuspend(long dealerId, CancellationToken ct = default)
        {
            // ✅ CRITICAL: Must use tracking queries (not AsNoTracking) to update entities
            // 1. Suspend all Active/Inactive branches
            // When branches are suspended, branch suspend logic applies:
            // - Users remain Active but cannot create new orders/customers (validation blocks retail operations)
            // - Users can only complete existing orders
            var branchesToSuspend = await _db.Branches
                .Where(b => b.DealerId == dealerId
                    && (b.Status == BranchStatus.Active.ToString() || b.Status == BranchStatus.Inactive.ToString()))
                .ToListAsync(ct);

            foreach (var branch in branchesToSuspend)
            {
                branch.Status = BranchStatus.Suspended.ToString();
                branch.UpdatedAt = DateTime.UtcNow;
            }

            // Note: Users and Promotions are NOT modified here
            // - Users: Remain Active, but validation (ValidateBranchForRetail) will block retail operations
            // - Promotions: Remain Active, but validation will block usage when dealer/branch is suspended
            // This is consistent with branch suspend logic where users remain active

            // Note: Don't save here - let the calling handler save changes
            // All entities are tracked by EF Core, changes will be saved when SaveChangesAsync is called
        }

        /// <summary>
        /// Handle cascade effects when dealer is closed
        /// - All branches must already be closed (validated by calling handler)
        /// - All users → Auto deactivate
        /// - All promotions → Auto deactivate
        /// - All pricebooks → Auto deactivate
        /// - All agreements → Auto expire
        /// </summary>
        public async Task HandleDealerClose(long dealerId, CancellationToken ct = default)
        {
            // Note: Branches are already closed before this method is called
            // Validation is done in UpdateDealerHandler/CloseDealerHandler to ensure all branches are closed first
            // This ensures branch close validation (quotes/orders completed) is applied

            // 1. Deactivate all users
            var usersToDeactivate = await _db.Users
                .Where(u => u.DealerId == dealerId)
                .ToListAsync(ct);

            foreach (var user in usersToDeactivate)
            {
                user.Status = UserStatus.Inactive.ToString();
            }

            // 2. Deactivate all promotions
            var promotionsToDeactivate = await _db.Promotions
                .Where(p => p.DealerId == dealerId)
                .ToListAsync(ct);

            foreach (var promotion in promotionsToDeactivate)
            {
                promotion.Status = PromotionStatus.Expired;
            }

            // 3. Deactivate all pricebooks
            var pricebooksToDeactivate = await _db.Pricebooks
                .Where(p => p.DealerId == dealerId && p.Status == PricebookStatus.Active.ToString())
                .ToListAsync(ct);

            foreach (var pricebook in pricebooksToDeactivate)
            {
                pricebook.Status = PricebookStatus.Inactive.ToString();
            }

            // 4. Expire all Active agreements
            var agreementsToExpire = await _db.DealerAgreements
                .Where(a => a.DealerId == dealerId && a.Status == "Active")
                .ToListAsync(ct);

            foreach (var agreement in agreementsToExpire)
            {
                agreement.Status = "Expired"; // Agreement status is string, not enum
            }

            // Note: Don't save here - let the calling handler save changes
        }
    }
}

