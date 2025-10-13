using backend.Domain.Enums;

namespace backend.Common.Helpers;

public static class QuoteStatusRules
{
    private static readonly Dictionary<QuoteStatus, QuoteStatus[]> Next = new()
    {
        { QuoteStatus.Draft,     new[] { QuoteStatus.Finalized, QuoteStatus.Expired } },
        { QuoteStatus.Finalized, new[] { QuoteStatus.Confirmed, QuoteStatus.Expired } },
        { QuoteStatus.Confirmed, Array.Empty<QuoteStatus>() },
        { QuoteStatus.Expired,   Array.Empty<QuoteStatus>() }
    };

    public static bool CanTransit(QuoteStatus from, QuoteStatus to)
        => Next.TryGetValue(from, out var allow) && allow.Contains(to);
}
