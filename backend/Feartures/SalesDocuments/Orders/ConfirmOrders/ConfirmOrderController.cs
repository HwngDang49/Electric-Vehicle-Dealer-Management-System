using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.ConfirmOrders
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public sealed class ConfirmOrderController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ConfirmOrderController(IMediator mediator) => _mediator = mediator;

        /// <summary>
        /// Xác nhận một Đơn hàng sau khi đã đủ điều kiện (hợp đồng, ký, cọc).
        /// </summary>
        [HttpPatch("{id:long}/confirm")]
        public async Task<ActionResult<Result>> HandleAsync([FromRoute] long id, CancellationToken ct)
        {
            var command = new ConfirmOrderCommand
            {
                SalesDocId = id,
                DealerId = User.GetDealerId()
            };

            var result = await _mediator.Send(command, ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound) return NotFound(result);
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
