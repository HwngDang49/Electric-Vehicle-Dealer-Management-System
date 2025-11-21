using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using backend.Infrastructure.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.VNPay.VNPayReturn;

public class VNPayReturnHandler : IRequestHandler<VNPayReturnRequest, Result<VNPayReturnResponse>>
{
    private readonly EVDmsDbContext _db;
    private readonly IConfiguration _config;
    private readonly NotificationService _notificationService;

    public VNPayReturnHandler(EVDmsDbContext db, IConfiguration config, NotificationService notificationService)
    {
        _db = db;
        _config = config;
        _notificationService = notificationService;
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
                        .ThenInclude(c => c.Dealer)
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

                    // Cộng tiền vào walletBalance của dealer khi thanh toán claim thành công
                    if (claim.Dealer != null)
                    {
                        claim.Dealer.WalletBalance += settlement.PaidAmount;
                    }

                    await _db.SaveChangesAsync(ct);
                    
                    // Send notification to Dealer Manager about credit update
                    try
                    {
                        var dealer = await _db.Dealers
                            .AsNoTracking()
                            .FirstOrDefaultAsync(d => d.DealerId == claim.DealerId, ct);
                        
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
                        Console.WriteLine($"[VNPayReturnHandler] Error sending credit update notification for settlement: {ex.Message}");
                    }
                    
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
                    // Validate payment amount phải bằng invoice amount (đảm bảo invoice amount không thay đổi)
                    if (payment.Amount != payment.Invoice.Amount)
                    {
                        payment.Status = PaymentStatus.Failed.ToString();
                        payment.Invoice.Status = "Pending";
                        payment.Note = $"Payment failed: Payment amount ({payment.Amount:n0}) does not match invoice amount ({payment.Invoice.Amount:n0}). Invoice may have been modified.";
                        await _db.SaveChangesAsync(ct);
                        return Result.Error(payment.Note);
                    }

                    // Kiểm tra wallet đủ tiền TRƯỚC khi trừ CreditUsed (cho B2B Invoice)
                    if (payment.Invoice.InvoiceType == "B2B")
                    {
                        // Kiểm tra lại wallet có đủ tiền để thanh toán không
                        if (payment.Invoice.Dealer!.WalletBalance < payment.Amount)
                        {
                            // Fail payment nếu không đủ tiền (chưa trừ CreditUsed nên không cần revert)
                            payment.Status = PaymentStatus.Failed.ToString();
                            payment.Invoice.Status = "Pending";
                            payment.Note = "Payment failed: Wallet balance not enough to payment amount.";

                            await _db.SaveChangesAsync(ct);
                            return Result.Error($"Insufficient wallet balance. Current: {payment.Invoice.Dealer.WalletBalance:n0}, Required: {payment.Amount:n0}. Please ensure wallet has sufficient funds.");
                        }
                    }

                    // Chuyển status khi đã thanh toán thành công
                    payment.Status = "Captured";
                    payment.Invoice!.Status = "Paid";
                    payment.Note = "Payment successfully";

                    // trừ creditUsed 
                    var oldCreditUsed = payment.Invoice.Dealer!.CreditUsed;
                    payment.Invoice.Dealer.CreditUsed -= payment.Amount;
                    if (payment.Invoice.Dealer.CreditUsed < 0)
                    {
                        // Log warning và set về 0
                        payment.Invoice.Dealer.CreditUsed = 0;
                    }

                    // Trừ wallet_balance nếu là B2B Invoice
                    if (payment.Invoice.InvoiceType == "B2B")
                    {
                        var oldWalletBalance = payment.Invoice.Dealer.WalletBalance;
                        payment.Invoice.Dealer.WalletBalance -= payment.Amount;

                        // Đảm bảo WalletBalance không bao giờ âm
                        if (payment.Invoice.Dealer.WalletBalance < 0)
                        {
                            // Rollback bằng cách fail payment
                            payment.Status = PaymentStatus.Failed.ToString();
                            payment.Invoice.Status = "Pending";
                            payment.Note = "Payment failed: Wallet balance would become negative. This indicates a data integrity issue.";
                            payment.Invoice.Dealer.WalletBalance = oldWalletBalance; // Revert
                            payment.Invoice.Dealer.CreditUsed = oldCreditUsed; // Revert
                            await _db.SaveChangesAsync(ct);
                            return Result.Error("Payment failed: Wallet balance would become negative. Please contact support.");
                        }
                    }

                    // Cập nhật thanh toán
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
                            Console.WriteLine($"[VNPayReturnHandler] Error sending credit update notification for payment: {ex.Message}");
                        }
                    }

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

