using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Inventories.Create
{
    [ApiController]
    [Route("api/create")]
    [Authorize]

    public class CreateInventoryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreateInventoryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateInventoryRequest request, CancellationToken ct)
        {
            var result = await _mediator.Send(new CreateInventoryCommand(request));

            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return BadRequest(result);
        }
    }
}
