using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Invoices.Create
{
    [ApiController]
    [Route("api/create-retail-invoice")]
    public class CreateRetailInvoiceController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreateRetailInvoiceController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRetailInvoiceRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { error = "User not authenticated" });
            
            long value = long.Parse(userId);
            var result = await _mediator.Send(new CreateRetailInvoiceCommand(request, value));

            if (result.IsSuccess)
                return Ok(new { value = result.Value, message = "Retail invoice created successfully" });
            return BadRequest(new { errors = result.Errors });
        }
    }
}
