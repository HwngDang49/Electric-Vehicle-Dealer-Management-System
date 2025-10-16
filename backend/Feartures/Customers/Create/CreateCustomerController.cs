using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Customers.Create
{
    [ApiController]
    [Route("api/customers")]
    [Authorize]
    public class CreateCustomerController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CreateCustomerController(IMediator mediator) => _mediator = mediator;

        /// <summary>
        /// Tạo khách hàng mới (Dealer lấy từ token).
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Result<CreateCustomerResponse>>> Create(
            [FromBody] CreateCustomerRequest body,
            CancellationToken ct)
        {
            var result = await _mediator.Send(body, ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound) // Fixed CS0120 and CS0176
                    return NotFound(result);
                return BadRequest(result);
            }

            var locationUrl = $"/api/customers/{result.Value.CustomerId}";
            return Created(locationUrl, result);
        }
    }
}
