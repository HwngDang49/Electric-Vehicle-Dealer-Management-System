using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.BackorderOrder
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class BackorderOrderController : ControllerBase
    {
        private readonly IMediator _mediator;

        public BackorderOrderController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Chuyển order sang trạng thái Backordered (chờ xe về)
        /// </summary>
        [HttpPost("{orderId}/backorder")]
        public async Task<ActionResult<Result<string>>> BackorderOrder(
            long orderId,
            CancellationToken cancellationToken)
        {
            var command = new BackorderOrderCommand(orderId);
            var result = await _mediator.Send(command, cancellationToken);

            if (result.IsSuccess)
            {
                return Ok(new
                {
                    message = result.Value,
                    orderId = orderId,
                    status = "Backordered"
                });
            }

            if (result.Status == ResultStatus.NotFound)
            {
                return NotFound(new { message = result.Errors });
            }

            return BadRequest(new { message = result.Errors });
        }
    }
}

