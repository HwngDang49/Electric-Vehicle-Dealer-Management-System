using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Exceptions;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Quotes.SendQuote
{
    public sealed class SendQuoteHandler : IRequestHandler<SendQuoteCommand, Result<bool>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SendQuoteHandler(EVDmsDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<bool>> Handle(SendQuoteCommand request, CancellationToken cancellationToken)
        {
            // 1. Lấy DealerId từ JWT token (temporarily hardcoded for testing)
            // var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            var dealerId = 1L; // Hardcoded for testing

            // 2. Tìm báo giá theo QuoteId và DealerId
            var quoteToSend = await _dbContext.Quotes
                .Include(q => q.QuoteItems)
                .FirstOrDefaultAsync(q =>
                    q.QuoteId == request.QuoteId &&
                    q.DealerId == dealerId,
                    cancellationToken);

            // 3. Kiểm tra xem báo giá có tồn tại không
            if (quoteToSend is null)
                throw new NotFoundException($"Quote with ID #{request.QuoteId} was not found.");

            // Quy tắc B: Chỉ có thể gửi báo giá có status Draft
            if (quoteToSend.Status != "Draft")
                throw new BusinessRuleException($"Cannot send a quote with status '{quoteToSend.Status}'. Only Draft quotes can be sent.");

            // 4. Cập nhật locked_until (7 ngày từ ngày tạo) nhưng giữ nguyên status Draft
            var now = DateTime.UtcNow;
            quoteToSend.LockedUntil = now.AddDays(7); // +7 ngày
            quoteToSend.UpdatedAt = now;
            // KHÔNG thay đổi Status - vẫn giữ là "Draft"

            // 5. Lưu thay đổi vào database
            await _dbContext.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}