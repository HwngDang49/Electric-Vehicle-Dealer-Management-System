using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Inventories.GetListVin
{
    [ApiController]
    [Route("api/dealer/get/vins")]
    [Authorize]
    public class VinController : ControllerBase
    {
        private readonly IMediator _mediator;

        public VinController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách VIN theo chi nhánh với thông tin số lượng
        /// </summary>
        /// <param name="query">Thông tin filter</param>
        /// <param name="ct">Cancellation token</param>
        /// <returns>Danh sách VIN với số lượng</returns>
        [HttpGet("list")]
        public async Task<ActionResult<List<VinListItemDto>>> GetListVin(
            [FromQuery] GetListVinQuery query,
            CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }

    }
}
