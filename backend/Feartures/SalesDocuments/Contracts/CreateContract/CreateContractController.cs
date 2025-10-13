using Ardalis.Result;
using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Contracts.CreateContract
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class CreateContractController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CreateContractController(IMediator mediator) => _mediator = mediator;

        [HttpPost("{id:long}/contract")]
        public async Task<ActionResult<Result<bool>>> SetContractInfo(
            [FromRoute] long id,
            [FromBody] CreateContractCommand body,
            CancellationToken ct)
        {
            body.SalesDocId = id;
            body.DealerId = User.GetDealerId();

            var res = await _mediator.Send(body, ct);

            if (!res.IsSuccess)
            {
                // Có thể trả về response lỗi chung chung hơn cho gọn
                if (res.Status == ResultStatus.NotFound) return NotFound(res);
                return BadRequest(res);
            }

            // Trả về 201 Created cùng với số hợp đồng đã tạo
            return Ok(res);
        }
    }
}
