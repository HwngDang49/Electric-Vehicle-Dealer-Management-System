using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Dealers.Reactivate
{
    [ApiController]
    [Route("api/dealers")]
    public class ReactivateDealerController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ReactivateDealerController(IMediator mediator) => _mediator = mediator;

        [HttpPatch("{dealerId:long}/reactivate")]

        public async Task<IActionResult> Reactivate(long dealerId)
        {
            var result = await _mediator.Send(new ReactivateDealerCommand(dealerId));
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
