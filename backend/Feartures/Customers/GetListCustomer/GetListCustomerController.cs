using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Customers.GetListCustomer
{
    [ApiController]
    [Route("api/customers")]
    public class GetListCustomerController : ControllerBase
    {
        private readonly IMediator _mediator;
        public GetListCustomerController(IMediator mediator) => _mediator = mediator;


        [HttpGet]
        public async Task<ActionResult<PagedResult<GetCustomersDto>>> Get(
                [FromQuery] GetCustomersQuery query,
                CancellationToken cancellationToken)
        {
            // Gửi query cho MediatR để xử lý và trả về kết quả
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(result);
        }
    }
}
