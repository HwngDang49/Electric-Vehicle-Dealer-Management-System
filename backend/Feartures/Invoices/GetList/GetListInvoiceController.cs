using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Invoices.GetList
{
    [ApiController]
    [Route("api/invoices")]
    public class GetListInvoiceController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetListInvoiceController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetList()
        {
            var result = await _mediator.Send(new GetListInvoiceCommand());

            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }
            return BadRequest(result.Errors);
        }
    }
}
