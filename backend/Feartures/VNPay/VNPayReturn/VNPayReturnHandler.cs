using Ardalis.Result;
using backend.Common.Helpers;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.VNPay.VNPayReturn;

public class VNPayReturnHandler : IRequestHandler<VNPayReturnRequest, Result<VNPayReturnResponse>>
{
    private readonly EVDmsDbContext _db;
    private readonly IConfiguration _config;
    private readonly ILogger<VNPayReturnHandler> _logger;

    public VNPayReturnHandler(EVDmsDbContext db, IConfiguration config, ILogger<VNPayReturnHandler> logger)
    {
        _db = db;
        _config = config;
        _logger = logger;
    }

    public async Task<Result<VNPayReturnResponse>> Handle(VNPayReturnRequest req, CancellationToken ct)
    {
        try
        {
            // Validate signature - Lấy TẤT CẢ params trừ vnp_SecureHash và vnp_SecureHashType
            var hashSecret = _config["VNPay:HashSecret"]!;

            // Build dictionary từ tất cả properties của request
            var parameters = new Dictionary<string, string>();
            var props = req.GetType().GetProperties();
            foreach (var prop in props)
            {
                var name = prop.Name;
                var value = prop.GetValue(req)?.ToString() ?? "";

                // Bỏ qua vnp_SecureHash, vnp_SecureHashType và các giá trị rỗng
                if (name != "vnp_SecureHash" && name != "vnp_SecureHashType" && !string.IsNullOrEmpty(value))
                {
                    parameters[name] = value;
                }
            }

            // Sort và build query string theo VNPay format
            var sorted = new SortedDictionary<string, string>(parameters, StringComparer.Ordinal);
            var query = string.Join("&", sorted.Select(kv => $"{kv.Key}={System.Net.WebUtility.UrlEncode(kv.Value)}"));
            var calculatedHash = VNPayHelper.HmacSHA512(hashSecret, query);

            if (!calculatedHash.Equals(req.vnp_SecureHash, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Invalid VNPay signature for payment {TxnRef}", req.vnp_TxnRef);
                return Result.Error("Invalid signature");
            }

            // lấy payment
            if (!long.TryParse(req.vnp_TxnRef, out var paymentId))
                return Result.Error("Invalid TxnRef");

            var payment = await _db.Payments
                .Include(p => p.Invoice)
                .ThenInclude(i => i!.Dealer)
                .FirstOrDefaultAsync(p => p.PaymentId == paymentId, ct);

            if (payment == null) return Result.NotFound("Payment not found");

            // Update payment status
            if (req.vnp_ResponseCode == "00" && req.vnp_TransactionStatus == "00") //00 là thành công
            {
                // chuyển status khi sau khi đã thanh toán
                payment.Status = "Captured";
                payment.Invoice!.Status = "Paid";

                // trừ creditUsed 
                payment.Invoice.Dealer!.CreditUsed -= payment.Invoice.Amount;

                // Đảm bảo CreditUsed không âm
                if (payment.Invoice.Dealer.CreditUsed < 0)
                    payment.Invoice.Dealer.CreditUsed = 0;

                _logger.LogInformation("Payment {PaymentId} completed successfully ", paymentId);

                payment.PaidAt = DateTime.Now;
                await _db.SaveChangesAsync(ct);

                return Result.Success(new VNPayReturnResponse(true, "Payment successfully"));
            }
            else
            {
                payment.Status = "Failed";

                payment.PaidAt = DateTime.Now;
                await _db.SaveChangesAsync(ct);

                return Result.Success(new VNPayReturnResponse(false, "Payment failed"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing VNPay return");
            return Result.Error("Internal error");
        }
    }
}

