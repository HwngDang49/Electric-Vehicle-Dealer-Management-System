using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Dealers.Close
{
    [ApiController]
    [Route("api/dealers")]
    public class CloseDealerController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CloseDealerController(IMediator mediator) => _mediator = mediator;

        [HttpPatch("{dealerId:long}/close")]
        public async Task<IActionResult> Close([FromRoute] long dealerId, CancellationToken ct)
        {
            var result = await _mediator.Send(new CloseDealerCommand(dealerId));
            if (result.Status == Ardalis.Result.ResultStatus.Ok)
            {
                return Ok(result.Value); // 204
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
