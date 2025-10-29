using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.VNPay.VNPayIpn;

[ApiController]
[Route("api/vnpay")] 
public class VNPayIpnController : ControllerBase
{
    private readonly IMediator _mediator;

    public VNPayIpnController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // VNPay IPN thường bắn GET; để tương thích rộng, hỗ trợ cả GET
    [HttpGet("ipn")]
    public async Task<IActionResult> IpnGet([FromQuery] VNPayIpnRequest req)
    {
        var result = await _mediator.Send(req);
        if (!result.IsSuccess)
        {
            return Content("INVALID", "text/plain");
        }
        return Content("OK", "text/plain");
    }
}


