using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Dealers.Suspend
{
    [ApiController]
    [Route("api/dealers")]
    public class SuspendDealerController : ControllerBase
    {
        private readonly IMediator _mediator;
        public SuspendDealerController(IMediator mediator) => _mediator = mediator;

        [HttpPatch("{dealerId:long}/suspend")]
        public async Task<IActionResult> Suspend([FromRoute] long dealerId, CancellationToken ct)
        {
            var result = await _mediator.Send(new SuspendDealerCommand(dealerId));

            if (result.Status == ResultStatus.Ok)
            {
                return Ok(result.Value); // 204
            }
            if (result.Status == ResultStatus.NotFound)
            {
                return NotFound(result.Errors); // 404
            }
            // Bất kỳ trạng thái lỗi nào khác
            return BadRequest(result.Errors); // 400
        }
    }
}
