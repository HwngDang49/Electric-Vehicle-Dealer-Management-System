using System.Security.Claims;
using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Feartures.Users.GetCurrentUser;
using backend.Infrastructure.Data;
using MediatR;

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
        // check invoice
        var invoice = await _db.Invoices.FindAsync(new object[] { req.InvoiceId }, ct);
        if (invoice == null) return Result.NotFound("Invoice not found");
        var user = _http.HttpContext.User.GetUserId();

        // Create payment và update Invoice status
        var payment = new Payment
        {
            InvoiceId = req.InvoiceId,
            Amount = invoice.Amount,
            Method = "VNPay",
            Status = "Pending",
            CreatedBy = user
        };
        _db.Payments.Add(payment);

        // Dổi status invoice thành Processing
        invoice.Status = "Processing";

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

