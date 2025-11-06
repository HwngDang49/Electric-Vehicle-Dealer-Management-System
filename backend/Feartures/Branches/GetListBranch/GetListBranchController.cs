using backend.Common.Paging;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Branches.GetListBranch
{
    [ApiController]
    [Route("api/branches")]
    [Authorize]
    public class GetListBranchController : ControllerBase
    {
        private readonly IMediator _mediator;
        public GetListBranchController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<GetListBranchDto>>> GetAll([FromQuery] GetListBranchQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }
    }
}
