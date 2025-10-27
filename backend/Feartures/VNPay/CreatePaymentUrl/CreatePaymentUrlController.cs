using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.VNPay.CreatePaymentUrl;

[ApiController]
[Route("api/vnpay")]
public class CreatePaymentUrlController : ControllerBase
{
    private readonly IMediator _mediator;

    public CreatePaymentUrlController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreatePaymentUrl([FromBody] CreatePaymentUrlRequest req)
    {
        var result = await _mediator.Send(req);
        return result.IsSuccess 
            ? Ok(result.Value) 
            : BadRequest(result.Errors);
    }
}

