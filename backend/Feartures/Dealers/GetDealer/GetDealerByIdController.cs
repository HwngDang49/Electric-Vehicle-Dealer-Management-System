
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Dealers.GetDealer
{
    [ApiController]
    [Route("api/dealers")]
    public class GetDealerByIdController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetDealerByIdController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{dealerId:long}")]
        public async Task<IActionResult> GetByID(long dealerId)
        {
            var result = await _mediator.Send(new GetDealerByIdQuery(dealerId));
            if (result.IsSuccess)
                return Ok(result.Value);
            else if (result.Status == Ardalis.Result.ResultStatus.NotFound)
                return NotFound(result.Errors);
            else
                return BadRequest(result.Errors);
        }
    }
}
