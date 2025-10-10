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
        public async Task<IActionResult> Suspend(long dealerId)
        {
            var result = await _mediator.Send(new SuspendDealerCommand(dealerId));
            if (result.Status == Ardalis.Result.ResultStatus.Ok)
            {
                return NoContent(); // 204
            }
            if (result.Status == Ardalis.Result.ResultStatus.NotFound)
            {
                return NotFound(result.Errors); // 404
            }
            // Bất kỳ trạng thái lỗi nào khác
            return BadRequest(result.Errors); // 400
        }
    }
}
