using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.VNPay.CreateSettlementPaymentUrl
{
    [ApiController]
    [Route("api/vnpay")]
    [Authorize]
    public class CreateSettlementPaymentUrlController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreateSettlementPaymentUrlController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("settlement/create")]
        public async Task<IActionResult> CreateSettlementPaymentUrl([FromBody] CreateSettlementPaymentUrlRequest req)
        {
            var result = await _mediator.Send(req);
            return result.IsSuccess 
                ? Ok(result.Value) 
                : BadRequest(result.Errors);
        }
    }
}

