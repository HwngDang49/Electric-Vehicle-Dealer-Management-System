using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.VNPay.CreateSettlementPaymentUrl
{
    public class CreateSettlementPaymentUrlHandler : IRequestHandler<CreateSettlementPaymentUrlRequest, Result<CreateSettlementPaymentUrlResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IConfiguration _config;
        private readonly IHttpContextAccessor _http;

        public CreateSettlementPaymentUrlHandler(EVDmsDbContext db, IConfiguration config, IHttpContextAccessor http)
        {
            _db = db;
            _config = config;
            _http = http;
        }

        public async Task<Result<CreateSettlementPaymentUrlResponse>> Handle(CreateSettlementPaymentUrlRequest req, CancellationToken ct)
        {
            // Kiểm tra claim tồn tại
            var claim = await _db.Claims
                .Include(c => c.Settlements)
                .FirstOrDefaultAsync(c => c.ClaimId == req.ClaimId && c.AgreementId != null, ct);

            if (claim == null)
                return Result.NotFound("Rebate Claim not found");

            // Validation: Claim must be Approved before payment
            if (claim.Status != "Approved")
            {
                return Result.Error($"Cannot process payment for claim with status '{claim.Status}'. Claim must be 'Approved' before payment.");
            }

            // Validation: Check amount
            if (req.PaidAmount <= 0)
                return Result.Error("Paid amount must be greater than 0");

            // Tính tổng đã thanh toán hiện tại (chỉ tính settlement đã có ReferenceNo - đã thanh toán thành công)
            var totalPaidSoFar = claim.Settlements
                .Where(s => s.ReferenceNo != null)
                .Sum(s => s.PaidAmount);
            var remainingAmount = claim.Amount - totalPaidSoFar;

            // Kiểm tra nếu đã thanh toán đủ rồi thì không cho phép thanh toán thêm
            if (remainingAmount <= 0)
            {
                return Result.Error($"Claim has been fully paid. Cannot create new payment.");
            }

            if (req.PaidAmount > remainingAmount)
                return Result.Error($"Paid amount exceeds remaining amount. Remaining: {remainingAmount:C}");

            // Xóa các settlement pending (chưa có ReferenceNo) để tránh duplicate
            var pendingSettlements = claim.Settlements
                .Where(s => s.ReferenceNo == null)
                .ToList();

            if (pendingSettlements.Any())
            {
                _db.Settlements.RemoveRange(pendingSettlements);
            }

            // Tạo Settlement record mới (sẽ update ReferenceNo và PaidAt khi VNPay return thành công)
            var settlement = new Settlement
            {
                ClaimId = req.ClaimId,
                PaidAmount = req.PaidAmount,
                ReferenceNo = null // Sẽ update với VNPay transaction ref khi return thành công
            };

            _db.Settlements.Add(settlement);
            await _db.SaveChangesAsync(ct);

            // Lấy config VNPay
            var vnp = _config.GetSection("VNPay");
            var tmnCode = vnp["TmnCode"]!;
            var hashSecret = vnp["HashSecret"]!;
            var paymentUrl = vnp["PaymentUrl"]!;
            var returnUrl = vnp["ReturnUrl"]!;

            // Tạo parameters cho VNPay
            // Dùng SettlementId làm vnp_TxnRef để track khi return
            var parameters = new Dictionary<string, string>
            {
                { "vnp_Version", vnp["Version"]! },
                { "vnp_Command", "pay" },
                { "vnp_TmnCode", tmnCode },
                { "vnp_Amount", ((long)(req.PaidAmount * 100)).ToString() },
                { "vnp_CreateDate", DateTime.UtcNow.AddHours(7).ToString("yyyyMMddHHmmss") },
                { "vnp_CurrCode", "VND" },
                { "vnp_IpAddr", _http.HttpContext!.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1" },
                { "vnp_Locale", "vn" },
                { "vnp_OrderInfo", $"RebateSettlement_Claim{claim.ClaimId}_Settlement{settlement.SettlementId}" },
                { "vnp_OrderType", "other" },
                { "vnp_ReturnUrl", returnUrl },
                { "vnp_TxnRef", $"SETTLEMENT_{settlement.SettlementId}" } // Prefix để phân biệt với Invoice payment
            };

            // Build VNPay URL
            var url = VNPayHelper.BuildPaymentUrl(paymentUrl, hashSecret, parameters);

            return Result.Success(new CreateSettlementPaymentUrlResponse(url));
        }
    }
}

