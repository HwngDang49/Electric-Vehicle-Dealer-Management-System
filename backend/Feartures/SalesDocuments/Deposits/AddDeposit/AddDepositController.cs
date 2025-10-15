using Ardalis.Result;
using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Deposits.AddDeposit
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class AddDepositController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AddDepositController(IMediator mediator) => _mediator = mediator;

        [HttpPost("{id:long}/deposits")]
        public async Task<ActionResult<Result<long>>> HandleAsync(
            [FromRoute] long id,
            [FromBody] AddDepositCommand body,
            CancellationToken ct)
        {
            body.SalesDocId = id;
            body.DealerId = User.GetDealerId();

            var result = await _mediator.Send(body, ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound) return NotFound(result);
                return BadRequest(result);
            }

            var locationUrl = $"/api/orders/{id}";
            return Created(locationUrl, result);
        }
    }
}
