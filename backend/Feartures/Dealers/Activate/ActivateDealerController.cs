using Ardalis.Result;
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
        public async Task<IActionResult> Activate([FromRoute] long dealerId, CancellationToken ct)
        {
            var result = await _mediator.Send(new ActivateDealerCommand(dealerId), ct);

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
