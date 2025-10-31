using System.Security.Claims;
using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Feartures.Users.GetCurrentUser;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.VNPay.CreatePaymentUrl;

public class CreatePaymentUrlHandler : IRequestHandler<CreatePaymentUrlRequest, Result<CreatePaymentUrlResponse>>
{
    private readonly EVDmsDbContext _db;
    private readonly IConfiguration _config;
    private readonly IHttpContextAccessor _http;

    public CreatePaymentUrlHandler(EVDmsDbContext db, IConfiguration config, IHttpContextAccessor http)
    {
        _db = db;
        _config = config;
        _http = http;
    }

    public async Task<Result<CreatePaymentUrlResponse>> Handle(CreatePaymentUrlRequest req, CancellationToken ct)
    {
        // Kiểm tra invoice tồn tại
        var invoice = await _db.Invoices.FindAsync(new object[] { req.InvoiceId }, ct);
        if (invoice == null)
            return Result.NotFound("Invoice not found");

        var user = _http.HttpContext.User.GetUserId();

        // VALIDATION 1: Kiểm tra invoice status
        if (invoice.Status == InvoiceStatus.Paid.ToString())
            return Result.Error("Invoice already paid");

        if (invoice.Status == InvoiceStatus.Cancelled.ToString())
            return Result.Error("Cannot create payment for cancelled invoice");

        // Kiểm tra payment VNPay đã tồn tại
        var existingPayments = await _db.Payments
            .Where(p => p.InvoiceId == req.InvoiceId && p.Method == "VNPay")
            .ToListAsync(ct);

        // Nếu có payment Captured → không cho tạo mới (đã thanh toán thành công)
        if (existingPayments.Any(p => p.Status == PaymentStatus.Captured.ToString()))
        {
            return Result.Error("Invoice already paid successfully. Cannot create new payment.");
        }

        // Luôn tạo payment MỚI để có PaymentId mới (vnp_TxnRef mới)
        // VNPay không cho phép reuse cùng vnp_TxnRef, nên phải tạo payment mới mỗi lần
        // Nếu có payment Failed hoặc Pending cũ → vẫn cho tạo mới để retry
        // Payment cũ vẫn giữ nguyên để audit trail
        var payment = new Payment
        {
            InvoiceId = req.InvoiceId,
            Amount = invoice.Amount,
            Method = "VNPay",
            Status = PaymentStatus.Pending.ToString(),
            CreatedBy = user
        };
        _db.Payments.Add(payment);

        // KHÔNG set invoice.Status = "Processing" 
        // Invoice chỉ có Pending → Paid (khi thanh toán thành công)
        // Invoice giữ nguyên status hiện tại (thường là Pending)

        await _db.SaveChangesAsync(ct);

        // lấy config bên appsettings.json
        var vnp = _config.GetSection("VNPay");
        var tmnCode = vnp["TmnCode"]!;
        var hashSecret = vnp["HashSecret"]!;
        var paymentUrl = vnp["PaymentUrl"]!;
        var returnUrl = vnp["ReturnUrl"]!;

        //  parameters
        var parameters = new Dictionary<string, string>
        {
            { "vnp_Version", vnp["Version"]! },
            { "vnp_Command", "pay" },
            { "vnp_TmnCode", tmnCode },
            { "vnp_Amount", ((long)(invoice.Amount * 100)).ToString() },
            { "vnp_CreateDate", DateTime.UtcNow.AddHours(7).ToString("yyyyMMddHHmmss") },
            { "vnp_CurrCode", "VND" },
            { "vnp_IpAddr", "127.0.0.1" },
            { "vnp_Locale", "vn" },
            { "vnp_OrderInfo", $"Invoice{invoice.InvoiceNo}" },
            { "vnp_OrderType", "other" },
            { "vnp_ReturnUrl", returnUrl },
            { "vnp_TxnRef", payment.PaymentId.ToString() }
        };

        // Create URL
        var url = VNPayHelper.BuildPaymentUrl(paymentUrl, hashSecret, parameters);

        return Result.Success(new CreatePaymentUrlResponse(url));
    }
}

