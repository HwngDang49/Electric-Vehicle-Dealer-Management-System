using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Branches.Update;

[ApiController]
[Route("api/branches")]
public class UpdateBranchController : ControllerBase
{
    private readonly IMediator _mediator;

    public UpdateBranchController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPut("{branchId:long}")]
    public async Task<IActionResult> Update(long branchId, [FromBody] UpdateBranchRequest request)
    {
        if (branchId != request.BranchId)
        {
            return BadRequest("BranchId in path and body must match.");
        }

        var result = await _mediator.Send(new UpdateBranchCommand(request));

        if (result.IsSuccess)
            return NoContent();

        if (result.Status == Ardalis.Result.ResultStatus.NotFound)
            return NotFound(result.Errors);

        return BadRequest(result.Errors);
    }
}


