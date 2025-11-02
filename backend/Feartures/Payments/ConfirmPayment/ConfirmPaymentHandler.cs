using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Feartures.Payments.ConfirmPayment
{
    public sealed record ConfirmPaymentCommand(ConfirmPaymentRequest Request, long CurrentUserId) : IRequest<Result>;

    public sealed class ConfirmPaymentHandler : IRequestHandler<ConfirmPaymentCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        private readonly ILogger<ConfirmPaymentHandler> _logger;

        public ConfirmPaymentHandler(EVDmsDbContext db, ILogger<ConfirmPaymentHandler> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<Result> Handle(ConfirmPaymentCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // Kiểm tra invoice tồn tại
            var invoice = await _db.Invoices
                .Include(i => i.Dealer)
                .FirstOrDefaultAsync(i => i.InvoiceId == req.InvoiceId, ct);

            if (invoice is null)
            {
                return Result.NotFound($"Invoice {req.InvoiceId} not found");
            }

            // Validate status
            if (!Enum.TryParse<InvoiceStatus>(req.Status, out var newStatus))
            {
                return Result.Error($"Invalid status: {req.Status}");
            }

            var oldStatus = invoice.Status;
            invoice.Status = newStatus.ToString();

            // Nếu chuyển sang Paid, tự động confirm payment và trừ tiền
            if (newStatus == InvoiceStatus.Paid)
            {
                // Tìm payment Pending
                var payment = await _db.Payments
                    .Where(p => p.InvoiceId == req.InvoiceId && p.Status == PaymentStatus.Pending.ToString())
                    .OrderByDescending(p => p.PaymentId)
                    .FirstOrDefaultAsync(ct);

                if (payment != null)
                {
                    // Update payment status
                    payment.Status = PaymentStatus.Captured.ToString();
                    payment.PaidAt = DateTime.UtcNow;

                    // Trừ CreditUsed của dealer
                    if (invoice.Dealer != null)
                    {
                        invoice.Dealer.CreditUsed -= payment.Amount;
                        if (invoice.Dealer.CreditUsed < 0)
                            invoice.Dealer.CreditUsed = 0;

                        // Trừ wallet_balance nếu là B2B Invoice (PO payment)
                        // Note: Wallet balance đã được kiểm tra khi tạo payment, nên không cần check lại
                        if (invoice.InvoiceType == "B2B")
                        {
                            invoice.Dealer.WalletBalance -= payment.Amount;
                        }
                    }
                }
                else
                {
                    return Result.Error("No pending payment found with invoice");
                }
            }

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}

