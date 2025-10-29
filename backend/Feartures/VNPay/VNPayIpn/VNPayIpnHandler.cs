using Ardalis.Result;
using backend.Common.Helpers;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.VNPay.VNPayIpn;

public class VNPayIpnHandler : IRequestHandler<VNPayIpnRequest, Result<VNPayIpnResponse>>
{
    private readonly EVDmsDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<VNPayIpnHandler> _logger;

    public VNPayIpnHandler(EVDmsDbContext db, IConfiguration config, ILogger<VNPayIpnHandler> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
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
                payment.Status = "Captured";
                if (payment.Invoice != null)
                {
                    payment.Invoice.Status = "Paid";
                    if (payment.Invoice.Dealer != null)
                    {
                        payment.Invoice.Dealer.CreditUsed -= payment.Invoice.Amount;
                        if (payment.Invoice.Dealer.CreditUsed < 0)
                            payment.Invoice.Dealer.CreditUsed = 0;
                    }
                }
                payment.PaidAt = DateTime.Now;
                await _db.SaveChangesAsync(ct);
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


