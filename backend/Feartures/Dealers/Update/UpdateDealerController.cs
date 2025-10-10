using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Dealers.Update
{
    [ApiController]
    [Route("api/dealers")]
    public class UpdateDealerController : ControllerBase
    {
        private readonly IMediator _mediator;
        public UpdateDealerController(IMediator mediator) => _mediator = mediator;

        [HttpPut("{dealerId:long}")]
        public async Task<IActionResult> Update(long dealerId, [FromBody] UpdateDealerRequest request)
        {
            var result = await _mediator.Send(new UpdateDealerCommand(dealerId, request));
            if (result.IsSuccess)
                return Ok();
            else if (result.Status == Ardalis.Result.ResultStatus.NotFound)
                return NotFound(result.Errors);
            else
                return BadRequest(result.Errors);
        }
    }
}
