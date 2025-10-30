using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Invoices.GetRetailInvoices
{
    [ApiController]
    [Route("api/retail-invoices")]
    public class GetRetailInvoicesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetRetailInvoicesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetRetailInvoices([FromQuery] GetRetailInvoicesRequest request)
        {
            try
            {
                // Get current user's dealer ID from claims
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (long.TryParse(userId, out var currentUserId))
                {
                    // You might want to get dealer ID from user context
                    // For now, we'll use the provided DealerId or default to 1
                    request.DealerId = request.DealerId ?? 1;
                }

                var result = await _mediator.Send(new GetRetailInvoicesQuery(request));

                if (result.IsSuccess)
                {
                    return Ok(result.Value);
                }

                return BadRequest(new { errors = result.Errors });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }
    }
}
