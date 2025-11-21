using Ardalis.Result;
using backend.Common.Helpers;
using backend.Infrastructure.Data;
using backend.Infrastructure.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.VNPay.VNPayIpn;

public class VNPayIpnHandler : IRequestHandler<VNPayIpnRequest, Result<VNPayIpnResponse>>
{
    private readonly EVDmsDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<VNPayIpnHandler> _logger;
    private readonly NotificationService _notificationService;

    public VNPayIpnHandler(EVDmsDbContext db, IConfiguration config, ILogger<VNPayIpnHandler> logger, NotificationService notificationService)
    {
        _db = db;
        _config = config;
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task<Result<VNPayIpnResponse>> Handle(VNPayIpnRequest req, CancellationToken ct)
    {
        try
        {
            var hashSecret = _config["VNPay:HashSecret"]!;

            // Collect all params except secure hash fields and empty values
            var parameters = new Dictionary<string, string>();
            var props = req.GetType().GetProperties();
            foreach (var prop in props)
            {
                var name = prop.Name;
                var value = prop.GetValue(req)?.ToString() ?? "";
                if (name != "vnp_SecureHash" && name != "vnp_SecureHashType" && !string.IsNullOrEmpty(value))
                {
                    parameters[name] = value;
                }
            }

            var sorted = new SortedDictionary<string, string>(parameters, StringComparer.Ordinal);
            var query = string.Join("&", sorted.Select(kv => $"{kv.Key}={System.Net.WebUtility.UrlEncode(kv.Value)}"));
            var calculatedHash = VNPayHelper.HmacSHA512(hashSecret, query);

            if (!calculatedHash.Equals(req.vnp_SecureHash, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Invalid VNPay IPN signature for TxnRef {TxnRef}", req.vnp_TxnRef);
                return Result.Error("Invalid signature");
            }

            if (!long.TryParse(req.vnp_TxnRef, out var paymentId))
                return Result.Error("Invalid TxnRef");

            var payment = await _db.Payments
                .Include(p => p.Invoice)
                .ThenInclude(i => i!.Dealer)
                .FirstOrDefaultAsync(p => p.PaymentId == paymentId, ct);

            if (payment == null) return Result.NotFound("Payment not found");

            // Idempotent-ish: if already captured, acknowledge OK
            if (payment.Status == "Captured")
            {
                return Result.Success(new VNPayIpnResponse(true, "Already captured"));
            }

            if (req.vnp_ResponseCode == "00" && req.vnp_TransactionStatus == "00")
            {
                // Validate payment amount phải bằng invoice amount (đảm bảo invoice amount không thay đổi)
                if (payment.Invoice != null && payment.Amount != payment.Invoice.Amount)
                {
                    _logger.LogWarning(
                        "Payment amount mismatch in IPN for Payment {PaymentId}. Payment Amount: {PaymentAmount}, Invoice Amount: {InvoiceAmount}",
                        paymentId, payment.Amount, payment.Invoice.Amount);
                    payment.Status = "Failed";
                    payment.Note = $"Payment amount mismatch. Payment: {payment.Amount:n0}, Invoice: {payment.Invoice.Amount:n0}";
                    await _db.SaveChangesAsync(ct);
                    return Result.Error("Payment amount does not match invoice amount");
                }

                // Kiểm tra wallet đủ tiền TRƯỚC khi trừ (cho B2B Invoice)
                if (payment.Invoice != null && payment.Invoice.InvoiceType == "B2B" && payment.Invoice.Dealer != null)
                {
                    if (payment.Invoice.Dealer.WalletBalance < payment.Amount)
                    {
                        _logger.LogWarning(
                            "Insufficient wallet balance in IPN for Payment {PaymentId}. Current: {WalletBalance}, Required: {Amount}",
                            paymentId, payment.Invoice.Dealer.WalletBalance, payment.Amount);
                        payment.Status = "Failed";
                        payment.Invoice.Status = "Pending";
                        payment.Note = "Payment failed: Insufficient wallet balance";
                        await _db.SaveChangesAsync(ct);
                        return Result.Error($"Insufficient wallet balance. Current: {payment.Invoice.Dealer.WalletBalance:n0}, Required: {payment.Amount:n0}");
                    }
                }

                payment.Status = "Captured";
                if (payment.Invoice != null)
                {
                    payment.Invoice.Status = "Paid";
                    if (payment.Invoice.Dealer != null)
                    {
                        var oldCreditUsed = payment.Invoice.Dealer.CreditUsed;
                        payment.Invoice.Dealer.CreditUsed -= payment.Amount;
                        if (payment.Invoice.Dealer.CreditUsed < 0)
                        {
                            _logger.LogWarning(
                                "CreditUsed would be negative in IPN for Dealer {DealerId} after payment {PaymentId}. Old CreditUsed: {OldCreditUsed}, Payment Amount: {Amount}, New CreditUsed would be: {NewCreditUsed}. Setting to 0.",
                                payment.Invoice.Dealer.DealerId, paymentId, oldCreditUsed, payment.Amount, payment.Invoice.Dealer.CreditUsed);
                            payment.Invoice.Dealer.CreditUsed = 0;
                        }

                        // Trừ wallet_balance nếu là B2B Invoice (PO payment) - FIX: thiếu logic này
                        if (payment.Invoice.InvoiceType == "B2B")
                        {
                            var oldWalletBalance = payment.Invoice.Dealer.WalletBalance;
                            payment.Invoice.Dealer.WalletBalance -= payment.Amount;
                            
                            // Đảm bảo WalletBalance không bao giờ âm
                            if (payment.Invoice.Dealer.WalletBalance < 0)
                            {
                                _logger.LogError(
                                    "WalletBalance would be negative in IPN for Dealer {DealerId} after payment {PaymentId}. Old WalletBalance: {OldWalletBalance}, Payment Amount: {Amount}, New WalletBalance would be: {NewWalletBalance}. This should not happen!",
                                    payment.Invoice.Dealer.DealerId, paymentId, oldWalletBalance, payment.Amount, payment.Invoice.Dealer.WalletBalance);
                                // Fail payment
                                payment.Status = "Failed";
                                payment.Invoice.Status = "Pending";
                                payment.Note = "Payment failed: Wallet balance would become negative";
                                payment.Invoice.Dealer.WalletBalance = oldWalletBalance; // Revert
                                payment.Invoice.Dealer.CreditUsed = oldCreditUsed; // Revert
                                await _db.SaveChangesAsync(ct);
                                return Result.Error("Payment failed: Wallet balance would become negative. Please contact support.");
                            }
                        }
                    }
                }
                payment.PaidAt = DateTime.Now;
                await _db.SaveChangesAsync(ct);
                
                // Send notification to Dealer Manager about credit update
                if (payment.Invoice?.Dealer != null)
                {
                    try
                    {
                        var dealer = await _db.Dealers
                            .AsNoTracking()
                            .FirstOrDefaultAsync(d => d.DealerId == payment.Invoice.Dealer.DealerId, ct);
                        
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
                        _logger.LogWarning(ex, "Error sending credit update notification for IPN payment");
                    }
                }
                
                _logger.LogInformation("IPN processed success for payment {PaymentId}", paymentId);
                return Result.Success(new VNPayIpnResponse(true, "Payment successfully"));
            }
            else
            {
                payment.Status = "Failed";
                payment.PaidAt = DateTime.Now;
                await _db.SaveChangesAsync(ct);
                _logger.LogInformation("IPN processed failure for payment {PaymentId}", paymentId);
                return Result.Success(new VNPayIpnResponse(false, "Payment failed"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing VNPay IPN");
            return Result.Error("Internal error");
        }
    }
}


