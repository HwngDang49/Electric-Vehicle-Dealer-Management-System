using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Branches.GetBranch
{


    [ApiController]
    [Route("api/branches")]
    public class GetBranchByIdController : ControllerBase

    {
        private readonly IMediator _mediator;
        public GetBranchByIdController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet("{branchId:long}")]
        public async Task<IActionResult> Handle([FromRoute] long branchId, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetBranchByIdQuery(branchId), ct);
            if (result.IsSuccess)
                return Ok(result.Value);
            else if (result.Status == ResultStatus.NotFound)
                return NotFound(result.Errors);
            else
                return BadRequest(result.Errors);
        }

    }
}
