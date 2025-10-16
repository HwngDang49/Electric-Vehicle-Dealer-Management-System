using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Quotes.GetQuoteDetails
{
    [ApiController]
    [Route("api/quotes")]
    [Authorize]
    public sealed class GetQuoteDetailsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public GetQuoteDetailsController(IMediator mediator) => _mediator = mediator;

        [HttpGet("{id:long}")]
        public async Task<ActionResult<GetQuoteDetailDto>> GetById([FromRoute] long id, CancellationToken ct)
        {
            var query = new GetQuoteByIdQuery { SalesDocId = id };
            var dto = await _mediator.Send(query, ct);
            return Ok(dto);
        }
    }
}
