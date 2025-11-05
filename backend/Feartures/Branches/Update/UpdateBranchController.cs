using Ardalis.Result;
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
    public async Task<IActionResult> Update(long branchId, [FromBody] UpdateBranchRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateBranchCommand(branchId, request));

        if (result.IsSuccess)
            return Ok(result.Value);

        if (result.Status == ResultStatus.NotFound)
            return NotFound(result.Errors);

        return BadRequest(result.Errors);
    }
}


