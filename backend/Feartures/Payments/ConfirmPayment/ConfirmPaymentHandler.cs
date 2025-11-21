using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using backend.Infrastructure.Services;
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
        private readonly NotificationService _notificationService;

        public ConfirmPaymentHandler(EVDmsDbContext db, ILogger<ConfirmPaymentHandler> logger, NotificationService notificationService)
        {
            _db = db;
            _logger = logger;
            _notificationService = notificationService;
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
                    // Validate payment amount phải bằng invoice amount (đảm bảo invoice amount không thay đổi)
                    if (payment.Amount != invoice.Amount)
                    {
                        _logger.LogWarning(
                            "Payment amount mismatch for Invoice {InvoiceId}. Payment Amount: {PaymentAmount}, Invoice Amount: {InvoiceAmount}",
                            invoice.InvoiceId, payment.Amount, invoice.Amount);
                        return Result.Error($"Payment amount ({payment.Amount:n0}) does not match invoice amount ({invoice.Amount:n0}). Invoice may have been modified.");
                    }

                    // Kiểm tra wallet_balance đủ tiền nếu là B2B Invoice (PO payment) - check lại để đảm bảo consistency
                    if (invoice.InvoiceType == "B2B" && invoice.Dealer != null)
                    {
                        if (invoice.Dealer.WalletBalance < payment.Amount)
                        {
                            _logger.LogWarning(
                                "Insufficient wallet balance when confirming payment for Invoice {InvoiceId}. Current: {WalletBalance}, Required: {Amount}",
                                invoice.InvoiceId, invoice.Dealer.WalletBalance, payment.Amount);
                            return Result.Error($"Insufficient wallet balance. Current: {invoice.Dealer.WalletBalance:n0}, Required: {payment.Amount:n0}.");
                        }
                    }

                    // Update payment status
                    payment.Status = PaymentStatus.Captured.ToString();
                    payment.PaidAt = DateTime.UtcNow;

                    // Trừ CreditUsed của dealer
                    if (invoice.Dealer != null)
                    {
                        var oldCreditUsed = invoice.Dealer.CreditUsed;
                        invoice.Dealer.CreditUsed -= payment.Amount;
                        
                        // Đảm bảo CreditUsed không bao giờ âm và log nếu có vấn đề
                        if (invoice.Dealer.CreditUsed < 0)
                        {
                            _logger.LogWarning(
                                "CreditUsed would be negative for Dealer {DealerId} after payment {PaymentId}. Old CreditUsed: {OldCreditUsed}, Payment Amount: {Amount}, New CreditUsed would be: {NewCreditUsed}. Setting to 0.",
                                invoice.Dealer.DealerId, payment.PaymentId, oldCreditUsed, payment.Amount, invoice.Dealer.CreditUsed);
                            invoice.Dealer.CreditUsed = 0;
                        }

                        // Trừ wallet_balance nếu là B2B Invoice (PO payment)
                        if (invoice.InvoiceType == "B2B")
                        {
                            var oldWalletBalance = invoice.Dealer.WalletBalance;
                            invoice.Dealer.WalletBalance -= payment.Amount;
                            
                            // Đảm bảo WalletBalance không bao giờ âm
                            if (invoice.Dealer.WalletBalance < 0)
                            {
                                _logger.LogError(
                                    "WalletBalance would be negative for Dealer {DealerId} after payment {PaymentId}. Old WalletBalance: {OldWalletBalance}, Payment Amount: {Amount}, New WalletBalance would be: {NewWalletBalance}. This should not happen!",
                                    invoice.Dealer.DealerId, payment.PaymentId, oldWalletBalance, payment.Amount, invoice.Dealer.WalletBalance);
                                // Rollback transaction bằng cách throw error
                                return Result.Error($"Wallet balance would become negative. This indicates a data integrity issue. Please contact support.");
                            }
                        }
                    }
                }
                else
                {
                    return Result.Error("No pending payment found with invoice");
                }
            }

            await _db.SaveChangesAsync(ct);

            // Send notification to Dealer Manager about credit update
            if (invoice.Dealer != null)
            {
                try
                {
                    // Reload dealer to get updated values
                    var dealer = await _db.Dealers
                        .AsNoTracking()
                        .FirstOrDefaultAsync(d => d.DealerId == invoice.DealerId, ct);
                    
                    if (dealer != null)
                    {
                        var creditAvailable = dealer.CreditLimit - dealer.CreditUsed;
                        await _notificationService.NotifyDealerCreditUpdated(
                            dealer.DealerId,
                            dealer.CreditLimit,
                            dealer.CreditUsed,
                            creditAvailable,
                            dealer.WalletBalance
                        );
                    }
                }
                catch (Exception ex)
                {
                    // Log error but don't fail payment confirmation
                    _logger.LogWarning(ex, "Error sending credit update notification for payment confirmation");
                }
            }

            return Result.Success();
        }
    }
}

