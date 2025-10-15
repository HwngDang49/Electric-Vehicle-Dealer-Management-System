using backend.Common.Auth;
using backend.Common.Paging;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Quotes.GetQuotes
{
    [ApiController]
    [Route("api/quotes")]
    [Authorize]
    public sealed class GetQuotesController : ControllerBase
    {
        private readonly IMediator _mediator;
        public GetQuotesController(IMediator mediator) => _mediator = mediator;

        [HttpGet]
        public async Task<ActionResult<PagedResult<GetQuotesDto>>> Get(
            [FromQuery] GetQuotesQuery query,
            CancellationToken ct)
        {
            query.DealerId = User.GetDealerId();   // ép từ JWT
            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }
    }
}
