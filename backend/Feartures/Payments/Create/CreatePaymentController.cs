using Ardalis.Result;
using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Payments.Create
{
    [ApiController]
    [Route("api/payments")]
    [Authorize]
    public class CreatePaymentController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreatePaymentController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest req, CancellationToken ct)
        {
            var userId = User.GetUserId();
            var result = await _mediator.Send(new CreatePaymentCommand(req, userId ?? 0));

            if (result.IsSuccess && userId != 0)
            {
                return Ok(result);
            }

            return BadRequest(result.Errors);
        }
    }
}

