using Ardalis.Result;
using backend.Common.Exceptions;
using backend.Common.Helpers;            // DateTimeHelper + QuoteStatusRules
using backend.Domain.Enums;              // DocType, QuoteStatus
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.SalesDocuments.FinalizeQuote;

public sealed class FinalizeQuoteHandler : IRequestHandler<FinalizeQuoteCommand, Result<bool>>
{
    private readonly EVDmsDbContext _db;
    public FinalizeQuoteHandler(EVDmsDbContext db) => _db = db;

    public async Task<Result<bool>> Handle(FinalizeQuoteCommand cmd, CancellationToken ct)
    {
        var quote = await _db.SalesDocuments
            .Include(sd => sd.SalesDocumentItems)
            .FirstOrDefaultAsync(sd =>
                sd.SalesDocId == cmd.SalesDocId &&
                sd.DealerId == cmd.DealerId &&
                sd.DocType == DocTypeEnum.Quote.ToString(), ct);

        if (quote is null)
            throw new NotFoundException($"Quote #{cmd.SalesDocId} not found.");

        var cur = quote.QuoteStatusEnum ?? QuoteStatus.Draft;
        if (!QuoteStatusRules.CanTransit(cur, QuoteStatus.Finalized))
            throw new BusinessRuleException($"Cannot finalize from status '{cur}'.");

        if (quote.SalesDocumentItems == null || quote.SalesDocumentItems.Count == 0)
            throw new BusinessRuleException("Quote must have at least one item to finalize.");

        // Recalculate total_amount
        quote.TotalAmount = quote.SalesDocumentItems.Sum(i =>
            (i.UnitPrice * i.Qty) - i.LineDiscount - i.LinePromo);

        var now = DateTimeHelper.UtcNow();
        quote.LockedUntil = cmd.LockedUntil ?? now.AddDays(cmd.LockDays ?? 7);
        quote.QuoteStatusEnum = QuoteStatus.Finalized;
        quote.UpdatedAt = now;

        await _db.SaveChangesAsync(ct);
        return Result.Success(true);
    }
}
