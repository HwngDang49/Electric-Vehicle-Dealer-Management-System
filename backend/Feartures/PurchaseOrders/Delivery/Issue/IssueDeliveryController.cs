using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.PurchaseOrders.Delivery.Issue
{
    [ApiController]
    [Route("api/po/{poId}/delivery/issue")]
    [Authorize]
    public sealed class IssueDeliveryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public IssueDeliveryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Issue([FromBody] IssueDeliveryRequest request)
        {
            var result = await _mediator.Send(new IssueDeliveryCommand(request));
            if (result.IsSuccess) return Ok(result);
            return BadRequest(result);
        }
    }
}


