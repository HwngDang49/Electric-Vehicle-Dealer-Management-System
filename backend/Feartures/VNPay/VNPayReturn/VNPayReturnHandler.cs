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

            // Kiểm tra loại payment: Invoice hay Settlement
            if (req.vnp_TxnRef.StartsWith("SETTLEMENT_"))
            {
                // Settlement payment
                if (!long.TryParse(req.vnp_TxnRef.Replace("SETTLEMENT_", ""), out var settlementId))
                {
                    return Result.Error("Invalid Settlement TxnRef");
                }

                var settlement = await _db.Settlements
                    .Include(s => s.Claim)
                    .FirstOrDefaultAsync(s => s.SettlementId == settlementId, ct);

                if (settlement == null)
                {
                    return Result.NotFound("Settlement not found");
                }

                if (req.vnp_ResponseCode == "00" && req.vnp_TransactionStatus == "00")
                {
                    // Thanh toán thành công - Update settlement
                    settlement.ReferenceNo = req.vnp_TransactionNo;
                    settlement.PaidAt = DateTime.UtcNow;

                    // Update Claim status dựa trên tổng đã thanh toán
                    // Tính tổng đã thanh toán TRƯỚC settlement hiện tại (chỉ tính các settlement đã có ReferenceNo)
                    var previousPaidTotal = await _db.Settlements
                        .Where(s => s.ClaimId == settlement.ClaimId && s.ReferenceNo != null && s.SettlementId != settlementId)
                        .SumAsync(s => s.PaidAmount, ct);

                    // Tổng đã thanh toán = previous + settlement hiện tại (vừa thanh toán thành công)
                    var totalPaidSoFar = previousPaidTotal + settlement.PaidAmount;

                    var claim = settlement.Claim; // Dùng claim từ Include, không cần query lại

                    // Update claim status dựa trên tổng đã thanh toán
                    // CHECK constraint chỉ cho phép: Pending, Approved, Rejected, Settled
                    if (totalPaidSoFar >= claim.Amount)
                    {
                        // Đã thanh toán đủ hoặc vượt quá -> Settled
                        if (claim.Status == "Pending" || claim.Status == "Approved")
                        {
                            claim.Status = "Settled";
                            claim.ResolvedAt = DateTime.UtcNow;
                        }
                    }
                    // Nếu đã thanh toán một phần, giữ nguyên status hiện tại (Pending/Approved)

                    await _db.SaveChangesAsync(ct);
                    return Result.Success(new VNPayReturnResponse(true, "Settlement payment successfully"));
                }
                else
                {
                    // Thanh toán thất bại - xóa settlement record
                    _db.Settlements.Remove(settlement);
                    await _db.SaveChangesAsync(ct);
                    return Result.Success(new VNPayReturnResponse(false, "Settlement payment cancelled or failed"));
                }
            }
            else
            {
                // Invoice payment
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
        }
        catch (Exception ex)
        {
            return Result.Error($"Internal error: {ex.Message}");
        }
    }
}

