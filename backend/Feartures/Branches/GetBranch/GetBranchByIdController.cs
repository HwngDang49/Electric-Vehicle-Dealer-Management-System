using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
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
        public async Task<IActionResult> Handle(long branchId)
        {
            var result = await _mediator.Send(new GetBranchByIdQuery(branchId));
            if (result.IsSuccess)
                return Ok(result.Value);
            else if (result.Status == Ardalis.Result.ResultStatus.NotFound)
                return NotFound(result.Errors);
            else
                return BadRequest(result.Errors);
        }

    }
}
