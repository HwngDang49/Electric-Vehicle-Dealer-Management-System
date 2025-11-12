using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.VNPay.VNPayReturn;

[ApiController]
[Route("api/vnpay")]
public class VNPayReturnController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IConfiguration _config;

    public VNPayReturnController(IMediator mediator, IConfiguration config)
    {
        _mediator = mediator;
        _config = config;
    }

    [HttpGet("return")]
    public async Task<IActionResult> VNPayReturn([FromQuery] VNPayReturnRequest req)
    {
        try
        {
            var result = await _mediator.Send(req);

            // Redirect to frontend với TẤT CẢ query params từ VNPay
            var queryString = HttpContext.Request.QueryString.Value ?? "";
            var frontendBaseUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";

            // Thêm payment status vào query string để frontend biết kết quả thanh toán
            string paymentStatus = "failed"; // Mặc định là failed
            if (result.IsSuccess && result.Value != null)
            {
                paymentStatus = result.Value.Success ? "success" : "failed";
            }
            else if (result.IsError())
            {
                // Nếu có lỗi (ví dụ: wallet không đủ tiền), payment status là failed
                paymentStatus = "failed";
            }

            // Thêm payment_status vào query string
            var separator = queryString.Contains("?") ? "&" : "?";
            var frontendUrl = $"{frontendBaseUrl}/vnpay-return{queryString}{separator}payment_status={paymentStatus}";

            return Redirect(frontendUrl);
        }
        catch (Exception)
        {
            // Vẫn redirect về frontend với error param
            var queryString = HttpContext.Request.QueryString.Value ?? "";
            var frontendBaseUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";
            var separator = queryString.Contains("?") ? "&" : "?";
            var frontendUrl = $"{frontendBaseUrl}/vnpay-return{queryString}{separator}error=processing_error&payment_status=failed";

            return Redirect(frontendUrl);
        }
    }
}
