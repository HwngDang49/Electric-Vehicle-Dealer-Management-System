using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Invoices.Create
{
    [ApiController]
    [Route("api/create-invoice")]
    public class CreateInvoiceController : ControllerBase
    {
        private readonly IMediator _imediator;

        public CreateInvoiceController(IMediator imediator)
        {
            _imediator = imediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateInvoiceRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            long value = long.Parse(userId);
            var result = await _imediator.Send(new CreateInvoiceCommand(request, value));

            if (result.IsSuccess)
                return Ok(result);
            return BadRequest(result);
        }

    }
}
