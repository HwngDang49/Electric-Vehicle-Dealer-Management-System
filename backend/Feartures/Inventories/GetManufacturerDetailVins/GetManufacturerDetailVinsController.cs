using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Inventories.GetManufacturerDetailVins
{
    [ApiController]
    [Route("api/manufacturer/inventory")]
    [Authorize(Roles = "EVMStaff")]
    public class GetManufacturerDetailVinsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetManufacturerDetailVinsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("detail-vins")]
        public async Task<ActionResult<List<ManufacturerDetailVinDto>>> GetDetailVins(
            [FromQuery] GetManufacturerDetailVinsQuery query,
            CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }
    }
}

