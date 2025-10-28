using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.GetDeliveryList
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class GetDeliveryListController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetDeliveryListController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("deliveries")]
        public async Task<ActionResult<DeliveryListResponse>> GetDeliveryList(
            [FromQuery] string? status = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            var query = new GetDeliveryListQuery(status, pageNumber, pageSize);
            var result = await _mediator.Send(query, cancellationToken);

            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }

            return BadRequest(new { message = result.Errors.FirstOrDefault() });
        }
    }
}

