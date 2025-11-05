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
        /// - All Active users → Auto suspend
        /// - All Active promotions → Auto deactivate
        /// </summary>
        public async Task HandleDealerSuspend(long dealerId, CancellationToken ct = default)
        {
            // ✅ CRITICAL: Must use tracking queries (not AsNoTracking) to update entities
            // 1. Suspend all Active/Inactive branches
            var branchesToSuspend = await _db.Branches
                .Where(b => b.DealerId == dealerId
                    && (b.Status == BranchStatus.Active.ToString() || b.Status == BranchStatus.Inactive.ToString()))
                .ToListAsync(ct);

            foreach (var branch in branchesToSuspend)
            {
                branch.Status = BranchStatus.Suspended.ToString();
                branch.UpdatedAt = DateTime.UtcNow;
            }

            // 2. Suspend all Active users
            var usersToSuspend = await _db.Users
                .Where(u => u.DealerId == dealerId && u.Status == UserStatus.Active.ToString())
                .ToListAsync(ct);

            foreach (var user in usersToSuspend)
            {
                user.Status = UserStatus.Inactive.ToString();
            }

            // 3. Deactivate all Active promotions
            var promotionsToDeactivate = await _db.Promotions
                .Where(p => p.DealerId == dealerId && p.Status == PromotionStatus.Active)
                .ToListAsync(ct);

            foreach (var promotion in promotionsToDeactivate)
            {
                promotion.Status = PromotionStatus.Expired;
            }

            // Note: Don't save here - let the calling handler save changes
            // All entities are tracked by EF Core, changes will be saved when SaveChangesAsync is called
        }

        /// <summary>
        /// Handle cascade effects when dealer is closed
        /// - All branches (except Closed) → Auto close
        /// - All users → Auto deactivate
        /// - All promotions → Auto deactivate
        /// - All pricebooks → Auto deactivate
        /// - All agreements → Auto expire
        /// </summary>
        public async Task HandleDealerClose(long dealerId, CancellationToken ct = default)
        {
            // 1. Close all branches (except already Closed)
            var branchesToClose = await _db.Branches
                .Where(b => b.DealerId == dealerId && b.Status != BranchStatus.Closed.ToString())
                .ToListAsync(ct);

            foreach (var branch in branchesToClose)
            {
                branch.Status = BranchStatus.Closed.ToString();
                branch.UpdatedAt = DateTime.UtcNow;
            }

            // 2. Deactivate all users
            var usersToDeactivate = await _db.Users
                .Where(u => u.DealerId == dealerId)
                .ToListAsync(ct);

            foreach (var user in usersToDeactivate)
            {
                user.Status = UserStatus.Inactive.ToString();
            }

            // 3. Deactivate all promotions
            var promotionsToDeactivate = await _db.Promotions
                .Where(p => p.DealerId == dealerId)
                .ToListAsync(ct);

            foreach (var promotion in promotionsToDeactivate)
            {
                promotion.Status = PromotionStatus.Expired;
            }

            // 4. Deactivate all pricebooks
            var pricebooksToDeactivate = await _db.Pricebooks
                .Where(p => p.DealerId == dealerId && p.Status == PricebookStatus.Active.ToString())
                .ToListAsync(ct);

            foreach (var pricebook in pricebooksToDeactivate)
            {
                pricebook.Status = PricebookStatus.Inactive.ToString();
            }

            // 5. Expire all Active agreements
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

