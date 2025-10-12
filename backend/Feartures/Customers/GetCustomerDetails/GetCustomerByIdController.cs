using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Customers.GetCustomerDetails
{
    [ApiController]
    [Route("api/customers")]
    public class GetCustomerByIdController : ControllerBase
    {
        private readonly IMediator _mediator;
        public GetCustomerByIdController(IMediator mediator) => _mediator = mediator;

        // Route name cần đúng để CreatedAtRoute() ở Create dùng được
        [HttpGet("{customerId:long}", Name = "GetCustomerById")]
        public async Task<ActionResult<GetCustomerDetailDto>> GetById([FromRoute] long customerId, CancellationToken ct)
        {
            var query = new GetCustomerByIdQuery { Id = customerId };
            var customerDetail = await _mediator.Send(query, ct);
            return Ok(customerDetail);
        }
    }
}
