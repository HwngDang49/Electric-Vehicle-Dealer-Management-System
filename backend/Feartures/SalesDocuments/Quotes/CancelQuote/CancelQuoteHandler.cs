using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Quotes.CancelQuote;

public sealed class CancelQuoteHandler : IRequestHandler<CancelQuoteCommand, Result>
{
    private readonly EVDmsDbContext _db;

    // Không cần IHttpContextAccessor nữa
    public CancelQuoteHandler(EVDmsDbContext db) => _db = db;

    public async Task<Result> Handle(CancelQuoteCommand request, CancellationToken ct)
    {
        // Bây giờ chúng ta có thể tin tưởng DealerId từ command
        var quote = await _db.Quotes.FirstOrDefaultAsync(q =>
                q.QuoteId == request.SalesDocId &&
                q.DealerId == request.DealerId, ct); // Dùng DealerId đã được validate

        if (quote is null)
        {
            return Result.NotFound($"Không tìm thấy Báo giá #{request.SalesDocId}.");
        }

        if (quote.Status != QuoteStatus.Draft.ToString() && quote.Status != QuoteStatus.Finalized.ToString())
        {
            return Result.Error($"Không thể hủy báo giá có trạng thái là '{quote.Status}'.");
        }

        quote.Status = QuoteStatus.Cancelled.ToString();
        quote.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}