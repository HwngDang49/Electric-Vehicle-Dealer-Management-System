using backend.Common.Paging;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.DealerAgreements.GetList
{
    [ApiController]
    [Route("api/dealer-agreements")]
    [Authorize]
    public class GetListDealerAgreementsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetListDealerAgreementsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetList(
            [FromQuery] long? dealerId,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            CancellationToken ct = default)
        {
            var query = new GetListDealerAgreementsQuery
            {
                DealerId = dealerId,
                Status = status,
                Page = page,
                PageSize = pageSize
            };

            var result = await _mediator.Send(query, ct);

            return Ok(result);
        }
    }
}

