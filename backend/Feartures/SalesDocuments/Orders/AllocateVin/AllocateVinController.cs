using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Orders.AllocateVin
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class AllocateVinController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AllocateVinController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Phân bổ VIN cho đơn hàng
        /// </summary>
        /// <param name="request">Thông tin phân bổ VIN</param>
        /// <param name="cancellationToken">Token hủy bỏ</param>
        /// <returns>Kết quả phân bổ VIN</returns>
        [HttpPost("allocate-vin")]
        public async Task<ActionResult<Result<string>>> AllocateVin(
            [FromBody] AllocateVinToRoRequest request,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var command = new AllocateVinToToCommand(request);
            var result = await _mediator.Send(command, cancellationToken);

            if (result.IsSuccess)
            {
                return Ok(new
                {
                    message = result.Value,
                    orderId = request.OrderId
                });
            }

            if (result.Status == ResultStatus.NotFound)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy đơn hàng hoặc VIN",
                    errors = result.Errors
                });
            }

            return BadRequest(new
            {
                message = "Không thể phân bổ VIN",
                errors = result.Errors
            });
        }

        [HttpGet("available-vins")]
        public async Task<ActionResult<PagedResult<AvailableVinDto>>> GetAvailableVins(
            [FromQuery] GetAvailableVinsQuery query,
            CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(result);
        }
    }
}
