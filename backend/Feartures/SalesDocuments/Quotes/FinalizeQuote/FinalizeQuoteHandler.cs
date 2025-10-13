using Ardalis.Result;
using backend.Common.Constants;
using backend.Common.Exceptions;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Quotes.FinalizeQuote;

public sealed class FinalizeQuoteHandler : IRequestHandler<FinalizeQuoteCommand, Result<bool>>
{
    private readonly EVDmsDbContext _dbContext;

    public FinalizeQuoteHandler(EVDmsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result<bool>> Handle(FinalizeQuoteCommand command, CancellationToken cancellationToken)
    {
        // 1. Tìm Báo giá (Quote) cần xử lý trong database.
        //    Sử dụng .Include() để tải kèm các 'items' của báo giá.
        var quoteToFinalize = await _dbContext.SalesDocuments
            .Include(quote => quote.SalesDocumentItems) // tải kèm các items
            .FirstOrDefaultAsync(quote =>
                quote.SalesDocId == command.SalesDocId &&
                quote.DealerId == command.DealerId &&
                quote.DocType == DocTypeEnum.Quote.ToString(),
                cancellationToken);



        // 2. Kiểm tra xem báo giá có tồn tại hay không.
        if (quoteToFinalize is null)
            throw new NotFoundException($"Quote with ID #{command.SalesDocId} was not found.");

        // 3. Kiểm tra các quy tắc nghiệp vụ (Business Rules).
        // Quy tắc A: Báo giá phải có ít nhất một sản phẩm.
        if (!quoteToFinalize.SalesDocumentItems.Any())
            throw new BusinessRuleException("Quote must have at least one item to be finalized.");

        // Quy tắc B: Trạng thái hiện tại phải cho phép chuyển sang 'Finalized'.
        if (!Enum.TryParse<QuoteStatus>(quoteToFinalize.Status, true, out var currentStatus))
            // Xử lý trường hợp trạng thái trong DB không hợp lệ.
            throw new BusinessRuleException($"The current status '{quoteToFinalize.Status}' is invalid.");

        if (!QuoteStatusRules.CanTransit(currentStatus, QuoteStatus.Finalized))
            throw new BusinessRuleException($"Cannot finalize a quote from its current status of '{currentStatus}'.");



        // 4. Cập nhật các thuộc tính của Báo giá.
        var utcNow = DateTimeHelper.UtcNow();

        // Tính toán lại tổng tiền để đảm bảo dữ liệu chính xác trước khi khóa.
        quoteToFinalize.TotalAmount = quoteToFinalize.SalesDocumentItems.Sum(item =>
            item.UnitPrice * item.Qty - item.LineDiscount - item.LinePromo);

        var now = DateTimeHelper.UtcNow();
        quoteToFinalize.LockedUntil = now.AddDays(Quote.DefaultLockDays);   // AUTO: +7 ngày
        quoteToFinalize.QuoteStatusEnum = QuoteStatus.Finalized;          // partial sẽ map string
        quoteToFinalize.UpdatedAt = now;

        // 5. Lưu các thay đổi vào database.
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}

