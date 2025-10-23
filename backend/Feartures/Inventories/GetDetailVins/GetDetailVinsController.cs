using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Inventories.GetDetailVins
{
    [ApiController]
    [Route("api/dealer/inventory")]
    [Authorize]
    public class GetDetailVinsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetDetailVinsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách VIN chi tiết theo branch và status
        /// </summary>
        /// <param name="branchId">ID chi nhánh</param>
        /// <param name="status">Trạng thái (InStock, Allocated, Ready, Delivered)</param>
        /// <param name="productId">ID sản phẩm (optional)</param>
        /// <param name="ct">Cancellation token</param>
        /// <returns>Danh sách VIN chi tiết</returns>
        [HttpGet("detail-vins")]
        public async Task<ActionResult<List<DetailVinDto>>> GetDetailVins(
            [FromQuery] long? branchId,
            [FromQuery] string? status,
            [FromQuery] long? productId,
            CancellationToken ct)
        {
            var query = new GetDetailVinsQuery
            {
                BranchId = branchId,
                Status = status,
                ProductId = productId
            };

            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }
    }
}

