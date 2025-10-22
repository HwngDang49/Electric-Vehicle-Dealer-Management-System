using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Pricebooks.Update
{
    [ApiController]
    [Route("api/evm/pricebooks")]
    [Authorize]
    public class UpdatePricebookController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UpdatePricebookController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Cập nhật tên bảng giá
        /// </summary>
        [HttpPut("{id}/name")]
        public async Task<IActionResult> UpdateName(
            [FromRoute] long id, 
            [FromBody] UpdatePricebookNameRequest request,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new UpdatePricebookNameCommand(id, request), ct);

            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Cập nhật trạng thái bảng giá (Active/Inactive)
        /// </summary>
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
            [FromRoute] long id,
            [FromBody] UpdatePricebookStatusRequest request,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new UpdatePricebookStatusCommand(id, request), ct);

            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
