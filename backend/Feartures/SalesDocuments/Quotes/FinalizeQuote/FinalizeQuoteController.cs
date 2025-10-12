using Ardalis.Result;
using backend.Common.Auth;       // User.GetDealerId()
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.SalesDocuments.FinalizeQuote;

[ApiController]
[Route("api/quotes")]
[Authorize]
public sealed class FinalizeQuoteController : ControllerBase
{
    private readonly IMediator _mediator;
    public FinalizeQuoteController(IMediator mediator) => _mediator = mediator;

    [HttpPatch("{id:long}/finalize")]
    public async Task<ActionResult<Result<bool>>> Finalize([FromRoute] long id, [FromBody] FinalizeQuoteCommand body, CancellationToken ct)
    {
        var cmd = new FinalizeQuoteCommand
        {
            SalesDocId = id,
            DealerId = User.GetDealerId(),
            LockDays = body.LockDays,
            LockedUntil = body.LockedUntil
        };

        var res = await _mediator.Send(cmd, ct);
        if (!res.IsSuccess)
            return Problem(title: "Cannot finalize quote", detail: res.Errors.FirstOrDefault(), statusCode: 400);

        return Ok(res);
    }
}
