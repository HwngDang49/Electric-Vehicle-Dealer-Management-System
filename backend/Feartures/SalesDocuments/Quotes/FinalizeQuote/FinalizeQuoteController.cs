using Ardalis.Result;
using backend.Feartures.SalesDocuments.Quotes.FinalizeQuote;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Features.SalesDocuments.FinalizeQuote
{
    [ApiController]
    [Route("api/quotes")]
    [Authorize]
    public sealed class FinalizeQuoteController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FinalizeQuoteController(IMediator mediator) => _mediator = mediator;

        [HttpPatch("{quoteId:long}/finalize")] // Sửa tên param cho rõ ràng hơn
        public async Task<ActionResult<Result<bool>>> Finalize([FromRoute] long quoteId, CancellationToken ct)
        {
            var cmd = new FinalizeQuoteCommand
            {
                QuoteId = quoteId
                // Không cần gán DealerId ở đây nữa
            };

            var res = await _mediator.Send(cmd, ct);
            if (!res.IsSuccess) return BadRequest(res);
            return Ok(res);
        }
    }
}