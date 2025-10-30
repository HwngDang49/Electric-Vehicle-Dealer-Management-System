using Ardalis.Result;
using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;

namespace backend.Feartures.Payments.CreateRetailPayment
{
    [ApiController]
    [Route("api/create-retail-payment")]
    [Authorize]
    public class CreateRetailPaymentController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CreateRetailPaymentController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRetailPaymentRequest req, CancellationToken ct)
        {
            var userId = User.GetUserId() ?? 0;
            var result = await _mediator.Send(new CreateRetailPaymentCommand(req, userId));
            if (result.IsSuccess)
                return Ok(new { paymentId = result.Value, amount = req.Amount });
            return BadRequest(new { errors = result.Errors });
        }
    }
}
