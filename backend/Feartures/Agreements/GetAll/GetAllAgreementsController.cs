using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Agreements.GetAll
{
    [ApiController]
    [Route("api/admin/agreements")]
    [Authorize]
    public sealed class GetAllAgreementsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetAllAgreementsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<Result<List<GetAllAgreementsQuery>>>> GetAllAgreements(
            [FromQuery] string? status = null,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(new GetAllAgreementsCommand { Status = status }, ct);

            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            return Ok(result.Value);
        }
    }
}
