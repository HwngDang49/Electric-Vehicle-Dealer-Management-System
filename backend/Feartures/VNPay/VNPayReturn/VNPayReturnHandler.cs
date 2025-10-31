using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.VNPay.VNPayReturn;

public class VNPayReturnHandler : IRequestHandler<VNPayReturnRequest, Result<VNPayReturnResponse>>
{
    private readonly EVDmsDbContext _db;
    private readonly IConfiguration _config;

    public VNPayReturnHandler(EVDmsDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<Result<VNPayReturnResponse>> Handle(VNPayReturnRequest req, CancellationToken ct)
    {
        try
        {
            //`Lấy TẤT CẢ params trừ vnp_SecureHash và vnp_SecureHashType
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

                payment.Note = "Payment successfully";

                // trừ creditUsed 
                payment.Invoice.Dealer!.CreditUsed -= payment.Invoice.Amount;
                if (payment.Invoice.Dealer.CreditUsed < 0)
                    payment.Invoice.Dealer.CreditUsed = 0;

                payment.PaidAt = DateTime.Now;
                await _db.SaveChangesAsync(ct);

                return Result.Success(new VNPayReturnResponse(true, "Payment successfully"));
            }
            else
            {
                // Thanh toán thất bại hoặc user hủy
                payment.Status = PaymentStatus.Failed.ToString();

                // Invoice giữ nguyên status hiện tại (thường là Pending) - KHÔNG thay đổi
                // Payment chuyển sang Failed để đánh dấu đã xử lý và thất bại
                // Ghi Note: Thanh toán không thành công
                payment.Note = "Payment Fail";

                await _db.SaveChangesAsync(ct);

                return Result.Success(new VNPayReturnResponse(false, "Payment cancelled or failed"));
            }
        }
        catch (Exception)
        {
            return Result.Error("Internal error");
        }
    }
}

