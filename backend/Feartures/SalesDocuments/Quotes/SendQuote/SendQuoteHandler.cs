using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Exceptions;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using backend.Infrastructure.Email;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Quotes.SendQuote
{
    public sealed class SendQuoteHandler : IRequestHandler<SendQuoteCommand, Result<bool>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailService _emailService;

        public SendQuoteHandler(
            EVDmsDbContext dbContext,
            IHttpContextAccessor httpContextAccessor,
            IEmailService emailService)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
            _emailService = emailService;
        }

        public async Task<Result<bool>> Handle(SendQuoteCommand request, CancellationToken cancellationToken)
        {
            // 1. Lấy DealerId từ JWT token
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            if (dealerId == null)
                return Result.Error("Dealer ID not found in token");

            // 2. Tìm báo giá theo QuoteId và DealerId (include các thông tin cần thiết)
            var quoteToSend = await _dbContext.Quotes
                .Include(q => q.QuoteItems)
                    .ThenInclude(qi => qi.Product)
                .Include(q => q.Customer)
                .Include(q => q.Dealer)
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

            // Kiểm tra customer có email không (bắt buộc để gửi báo giá)
            if (quoteToSend.Customer == null || string.IsNullOrWhiteSpace(quoteToSend.Customer.Email))
                return Result.Error("Customer email is required to send quotation. Please update customer email first.");

            // 4. Cập nhật locked_until (7 ngày từ ngày tạo) nhưng giữ nguyên status Draft
            var now = DateTime.UtcNow;
            quoteToSend.LockedUntil = now.AddDays(7); // +7 ngày
            quoteToSend.UpdatedAt = now;
            // KHÔNG thay đổi Status - vẫn giữ là "Draft"

            // 5. Lưu thay đổi vào database
            await _dbContext.SaveChangesAsync(cancellationToken);

            // 6. Gửi email báo giá cho customer
            try
            {
                await SendQuotationEmailAsync(quoteToSend, cancellationToken);
            }
            catch (Exception ex)
            {
                // Log lỗi nhưng không block việc gửi báo giá
                // Email có thể fail nhưng báo giá vẫn được gửi thành công
                Console.WriteLine($"Error sending quotation email: {ex.Message}");
            }

            return Result.Success(true);
        }

        private async Task SendQuotationEmailAsync(Quote quote, CancellationToken ct)
        {
            var customer = quote.Customer;
            var dealer = quote.Dealer;

            if (customer == null || string.IsNullOrWhiteSpace(customer.Email))
                return;

            var subject = QuotationEmailTemplate.GetEmailSubject(dealer);
            var htmlBody = QuotationEmailTemplate.BuildEmailBody(quote);

            await _emailService.SendEmailAsync(
                customer.Email,
                customer.FullName,
                subject,
                htmlBody,
                ct);
        }
    }
}