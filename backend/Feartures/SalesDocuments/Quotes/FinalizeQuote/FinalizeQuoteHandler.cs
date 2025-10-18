using Ardalis.Result;
using backend.Common.Auth; // Cần để dùng .GetDealerId()
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
    private readonly IHttpContextAccessor _httpContextAccessor;

    public FinalizeQuoteHandler(EVDmsDbContext dbContext, IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<bool>> Handle(FinalizeQuoteCommand command, CancellationToken cancellationToken)
    {
        // **Lấy DealerId trực tiếp từ context của user**
        var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

        // 1. Tìm Báo giá (Quote) cần xử lý trong database.
        var quoteToFinalize = await _dbContext.Quotes
            .Include(quote => quote.QuoteItems)
            .FirstOrDefaultAsync(quote =>
                quote.QuoteId == command.QuoteId &&
                quote.DealerId == dealerId, // **Sử dụng dealerId vừa lấy**
                cancellationToken);



        // 2. Kiểm tra xem báo giá có tồn tại hay không.
        if (quoteToFinalize is null)
            throw new NotFoundException($"Quote with ID #{command.QuoteId} was not found.");

        // 3. Kiểm tra các quy tắc nghiệp vụ (Business Rules).
        // Quy tắc A: Báo giá phải có ít nhất một sản phẩm.
        if (!quoteToFinalize.QuoteItems.Any())
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
        quoteToFinalize.TotalAmount = quoteToFinalize.QuoteItems.Sum(item =>
            item.UnitPrice * item.Qty - (item.OemDiscountApplied ?? 0) - (item.LinePromo ?? 0));

        var now = DateTimeHelper.UtcNow();
        quoteToFinalize.LockedUntil = now.AddDays(Quote.DefaultLockDays);   // AUTO: +7 ngày
        quoteToFinalize.Status = QuoteStatus.Finalized.ToString();          // partial sẽ map string
        quoteToFinalize.UpdatedAt = now;

        // 5. Lưu các thay đổi vào database.
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}

