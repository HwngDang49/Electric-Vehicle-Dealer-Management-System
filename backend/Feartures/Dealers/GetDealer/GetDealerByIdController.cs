using Ardalis.Result;
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
        public async Task<ActionResult<GetDealerDetailDto>> GetByID([FromQuery] GetDealerByIdQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            if (result.IsSuccess)
                return Ok(result.Value);
            else if (result.Status == ResultStatus.NotFound)
                return NotFound(result.Errors);
            else
                return BadRequest(result.Errors);
        }
    }
}
