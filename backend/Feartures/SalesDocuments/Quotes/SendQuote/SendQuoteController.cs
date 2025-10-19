using Ardalis.Result;
using backend.Feartures.SalesDocuments.Quotes.SendQuote;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Quotes.SendQuote
{
    [ApiController]
    [Route("api/quotes")]
    [Authorize]
    public sealed class SendQuoteController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SendQuoteController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Gửi báo giá - cập nhật locked_until nhưng giữ nguyên status Draft
        /// </summary>
        [HttpPatch("{quoteId:long}/send")]
        public async Task<ActionResult<Result<bool>>> SendQuote(
            [FromRoute] long quoteId,
            CancellationToken cancellationToken)
        {
            var command = new SendQuoteCommand
            {
                QuoteId = quoteId
            };

            var result = await _mediator.Send(command, cancellationToken);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }
    }
}