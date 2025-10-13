using Ardalis.Result;
using backend.Common.Auth;       // User.GetDealerId()
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

        // Không cần body — chỉ lấy id từ route
        [HttpPatch("{Quoteid:long}/finalize")]
        public async Task<ActionResult<Result<bool>>> Finalize([FromRoute] long Quoteid, CancellationToken ct)
        {
            var cmd = new FinalizeQuoteCommand
            {
                SalesDocId = Quoteid,
                DealerId = User.GetDealerId()
            };

            var res = await _mediator.Send(cmd, ct);
            if (!res.IsSuccess) return BadRequest(res);
            return Ok(res);
        }
    }
}
