using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MediatR;

namespace backend.Feartures.Invoices.GetRetailInvoiceById
{
    [ApiController]
    [Route("api/retail-invoices")]
    public class GetRetailInvoiceByIdController : ControllerBase
    {
        private readonly IMediator _mediator;
        public GetRetailInvoiceByIdController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] long id)
        {
            var request = new GetRetailInvoiceByIdRequest { InvoiceId = id };
            var result = await _mediator.Send(new GetRetailInvoiceByIdQuery(request));
            if (result.IsSuccess)
                return Ok(result.Value);
            return NotFound(result.Errors);
        }
    }
}
