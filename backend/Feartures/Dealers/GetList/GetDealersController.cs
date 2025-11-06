using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Dealers.GetList
{
    [ApiController]
    [Route("api/dealers")]
    public class GetDealersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetDealersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<GetDealersDto>>> Get(
                [FromQuery] GetDealersQuery query,
                CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(result);
        }
    }
}
