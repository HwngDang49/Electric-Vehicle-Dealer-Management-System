
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
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetDealersQuery());
            if (result.IsSuccess)
                return Ok(result.Value);
            else
                return BadRequest(result.Errors);
        }
    }
}
