using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Inventories.GetManufacturerInventory
{
    [ApiController]
    [Route("api/manufacturer/inventory")]
    [Authorize(Roles = "EVMStaff")] // Chỉ EVM Staff mới có thể truy cập
    public class GetManufacturerInventoryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetManufacturerInventoryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách inventory của hãng (Manufacturer) - chỉ cho EVM Staff
        /// </summary>
        /// <param name="query">Thông tin filter</param>
        /// <param name="ct">Cancellation token</param>
        /// <returns>Danh sách inventory theo sản phẩm</returns>
        [HttpGet("list")]
        public async Task<ActionResult<List<ManufacturerInventoryDto>>> GetManufacturerInventory(
            [FromQuery] GetManufacturerInventoryQuery query,
            CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }
    }
}

