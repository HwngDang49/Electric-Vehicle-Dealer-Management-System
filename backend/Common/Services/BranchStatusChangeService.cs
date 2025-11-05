using backend.Domain.Enums;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Common.Services
{
    /// <summary>
    /// Service for handling cascade effects when Branch status changes
    /// </summary>
    public class BranchStatusChangeService
    {
        private readonly EVDmsDbContext _db;

        public BranchStatusChangeService(EVDmsDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Handle cascade effects when branch is suspended
        /// - All Active users of branch → Auto suspend
        /// - Promotions with scope containing branch → Remove branch from scope or warning
        /// </summary>
        public async Task HandleBranchSuspend(long branchId, CancellationToken ct = default)
        {
            // 1. Suspend all Active users of branch
            var usersToSuspend = await _db.Users
                .Where(u => u.BranchId == branchId && u.Status == UserStatus.Active.ToString())
                .ToListAsync(ct);

            foreach (var user in usersToSuspend)
            {
                user.Status = UserStatus.Inactive.ToString();
            }

            // 2. Handle promotions with scope containing this branch
            // Option: Remove branch from scope or keep and let validation handle it
            // For now, we'll keep it and let validation block activation
            // If needed, we can remove branch from PromotionScopes:
            /*
            var promotionScopesToRemove = await _db.PromotionScopes
                .Where(ps => ps.BranchId == branchId)
                .ToListAsync(ct);
            
            _db.PromotionScopes.RemoveRange(promotionScopesToRemove);
            */

            // Note: Don't save here - let the calling handler save changes
        }

        /// <summary>
        /// Handle cascade effects when branch is closed
        /// - All users of branch → Auto deactivate
        /// - Promotions with scope containing branch → Remove branch from scope
        /// </summary>
        public async Task HandleBranchClose(long branchId, CancellationToken ct = default)
        {
            // 1. Deactivate all users of branch
            var usersToDeactivate = await _db.Users
                .Where(u => u.BranchId == branchId)
                .ToListAsync(ct);

            foreach (var user in usersToDeactivate)
            {
                user.Status = UserStatus.Inactive.ToString();
            }

            // 2. Remove branch from promotion scopes
            var promotionScopesToRemove = await _db.PromotionScopes
                .Where(ps => ps.BranchId == branchId)
                .ToListAsync(ct);

            _db.PromotionScopes.RemoveRange(promotionScopesToRemove);

            // Note: Don't save here - let the calling handler save changes
        }

        /// <summary>
        /// Handle when branch becomes active (from Suspended/Inactive)
        /// - No auto-activation of users (manual operation)
        /// - Can be used for logging/auditing
        /// </summary>
        public async Task HandleBranchActive(long branchId, CancellationToken ct = default)
        {
            // No automatic cascade when branch becomes active
            // Users and promotions remain in their current state
            // This is intentional - requires manual reactivation
            await Task.CompletedTask;
        }
    }
}

