using Ardalis.Result;
using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Quotes.CancelQuote;

[ApiController]
[Route("api/quotes")]
[Authorize]
public sealed class CancelQuoteController : ControllerBase
{
    private readonly IMediator _mediator;
    public CancelQuoteController(IMediator mediator) => _mediator = mediator;

    [HttpPatch("{id:long}/cancel")]
    public async Task<ActionResult<Result>> Cancel(
        [FromRoute] long id,
        [FromBody] CancelQuoteCommand command,
        CancellationToken ct)
    {
        command.SalesDocId = id;
        // KHÔNG gán DealerId ở đây nữa
        command.DealerId = User.GetDealerId();

        var result = await _mediator.Send(command, ct);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}