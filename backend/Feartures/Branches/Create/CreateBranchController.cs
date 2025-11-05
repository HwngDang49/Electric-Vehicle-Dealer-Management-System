using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Branches.Create
{
    [ApiController]
    [Route("api/branches")]
    public class CreateBranchController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CreateBranchController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("Create-Branch")]
        public async Task<ActionResult<Result<CreateBranchResponse>>> Create([FromBody] CreateBranchCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);

            if (result.IsSuccess)
                return Ok(result.Value);
            else
                return BadRequest(result.Errors);
        }
    }
}
