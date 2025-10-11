using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Customers.Create
{
    [ApiController]
    [Route("api/customers")]
    public class CreateCustomerController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CreateCustomerController(IMediator mediator) => _mediator = mediator;

        [HttpPost("Create-Customer")]
        public async Task<IActionResult> Create([FromBody] CreateCustomerRequest request)
        {
            var result = await _mediator.Send(new CreateCustomerCommand(request));
            if (result.IsSuccess)
                return Ok(new { customer_id = result.Value });
            else
                return BadRequest(result.Errors);
        }
    }
}
