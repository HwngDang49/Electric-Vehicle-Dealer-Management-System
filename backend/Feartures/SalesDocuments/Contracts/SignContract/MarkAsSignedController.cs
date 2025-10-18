using Ardalis.Result;
using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Contracts.SignContract
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class MarkAsSignedController : ControllerBase
    {
        private readonly IMediator _mediator;
        public MarkAsSignedController(IMediator mediator) => _mediator = mediator;

        /// <summary>
        /// Đánh dấu một hợp đồng đã được ký (ký tay) và ghi nhận thời gian.
        /// </summary>
        [HttpPatch("{id:long}/mark-as-signed")]
        public async Task<ActionResult<Result<DateTime>>> HandleAsync(
            [FromRoute] long id,
            CancellationToken ct)
        {
            var command = new MarkAsSignedCommand
            {
                OrderId = id,
                DealerId = User.GetDealerId()
            };

            var result = await _mediator.Send(command, ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound) return NotFound(result);
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
