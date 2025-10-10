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
        public async Task<IActionResult> Create([FromBody] CreateBranchRequest request)
        {
            var result = await _mediator.Send(new CreateBranchCommand(request));
            if (result.IsSuccess)
                return Ok(new { branch_id = result.Value });
            else
                return BadRequest(result.Errors);
        }
    }
}
