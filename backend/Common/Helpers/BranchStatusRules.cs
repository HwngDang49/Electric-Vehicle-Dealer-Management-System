using backend.Domain.Enums;

namespace backend.Common.Helpers
{
    public class BranchStatusRules
    {
        private static readonly Dictionary<BranchStatus, BranchStatus[]> Next = new()
        {
            { BranchStatus.Active,     new[] { BranchStatus.Inactive, BranchStatus.Suspended, BranchStatus.Closed } },
            { BranchStatus.Inactive,   new[] { BranchStatus.Active, BranchStatus.Suspended, BranchStatus.Closed } },
            { BranchStatus.Suspended,  new[] { BranchStatus.Active, BranchStatus.Inactive, BranchStatus.Closed } },
            { BranchStatus.Closed,     Array.Empty<BranchStatus>() }
        };

        public static bool CanTransit(BranchStatus from, BranchStatus to) =>
            Next.TryGetValue(from, out var allow) && allow.Contains(to);

        /// <summary>
        /// Check if branch can perform retail operations (create orders, quotes)
        /// </summary>
        public static bool CanPerformRetail(BranchStatus status) =>
            status == BranchStatus.Active;

        /// <summary>
        /// Check if branch can perform configuration operations (create users, etc.)
        /// </summary>
        public static bool CanPerformConfig(BranchStatus status) =>
            status == BranchStatus.Active || status == BranchStatus.Inactive;

        /// <summary>
        /// Check if branch is in a terminal state (cannot be changed)
        /// </summary>
        public static bool IsTerminal(BranchStatus status) =>
            status == BranchStatus.Closed;
    }
}

