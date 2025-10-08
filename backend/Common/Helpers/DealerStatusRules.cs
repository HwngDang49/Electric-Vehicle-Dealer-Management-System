using backend.Domain.Enums;

namespace backend.Common.Helpers
{
    public class DealerStatusRules
    {
        private static readonly Dictionary<DealerStatus, DealerStatus[]> Next = new()
    {
        { DealerStatus.Onboarding, new[] { DealerStatus.Live, DealerStatus.Closed } },
        { DealerStatus.Live,       new[] { DealerStatus.Suspended, DealerStatus.Closed } },
        { DealerStatus.Suspended,  new[] { DealerStatus.Live, DealerStatus.Closed } },
        { DealerStatus.Closed,     Array.Empty<DealerStatus>() }
    };

        public static bool CanTransit(DealerStatus from, DealerStatus to) =>
            Next.TryGetValue(from, out var allow) && allow.Contains(to);
    }
}
