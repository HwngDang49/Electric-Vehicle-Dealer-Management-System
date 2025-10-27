using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.VNPay.VNPayReturn;

[ApiController]
[Route("api/vnpay")]
public class VNPayReturnController : ControllerBase
{
    private readonly IMediator _mediator;

    public VNPayReturnController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("return")]
    public async Task<IActionResult> VNPayReturn([FromQuery] VNPayReturnRequest req)
    {
        var result = await _mediator.Send(req);

        // Redirect to frontend với TẤT CẢ query params từ VNPay
        var queryString = HttpContext.Request.QueryString.Value;
        var frontendUrl = $"http://localhost:5173/vnpay-return{queryString}";

        return Redirect(frontendUrl);
    }
}

