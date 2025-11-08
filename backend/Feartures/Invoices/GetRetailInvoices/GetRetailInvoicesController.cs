using System.Security.Claims;
using backend.Common.Auth;
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
                try
                {
                    var dealerId = User.GetDealerId();
                    // Ưu tiên DealerId từ query params (nếu có), nếu không thì dùng của user
                    request.DealerId = request.DealerId ?? dealerId;
                }
                catch (UnauthorizedAccessException)
                {
                    // Nếu user không có dealerId (vd: Manufacturer role), 
                    // chỉ filter nếu có DealerId trong query params
                    if (!request.DealerId.HasValue)
                    {
                        return BadRequest(new { error = "DealerId is required" });
                    }
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
