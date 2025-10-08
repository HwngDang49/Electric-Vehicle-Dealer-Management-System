using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Dealers.Activate
{
    [ApiController]
    [Route("api/dealers")]
    public class ActivateDealerController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ActivateDealerController(IMediator mediator) => _mediator = mediator;

        [HttpPatch("{dealerId:long}/activate")]
        public async Task<IActionResult> Activate(long dealerId)
        {
            var result = await _mediator.Send(new ActivateDealerCommand(dealerId));

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
