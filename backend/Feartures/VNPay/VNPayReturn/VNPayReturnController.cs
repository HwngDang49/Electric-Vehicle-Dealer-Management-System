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
            var frontendUrl = $"{frontendBaseUrl}/vnpay-return{queryString}";

            return Redirect(frontendUrl);
        }
        catch (Exception)
        {
            // Vẫn redirect về frontend với error param
            var queryString = HttpContext.Request.QueryString.Value ?? "";
            var frontendBaseUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";
            var frontendUrl = $"{frontendBaseUrl}/vnpay-return{queryString}&error=processing_error";

            return Redirect(frontendUrl);
        }
    }
}
