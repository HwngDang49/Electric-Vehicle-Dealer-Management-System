using Ardalis.Result;
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

        public async Task<IActionResult> Reactivate(long dealerId, CancellationToken ct)
        {
            var result = await _mediator.Send(new ReactivateDealerCommand(dealerId));
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
