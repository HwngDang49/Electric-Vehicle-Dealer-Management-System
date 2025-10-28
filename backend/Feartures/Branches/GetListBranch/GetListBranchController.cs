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
        public async Task<IActionResult> GetAll([FromQuery] long? dealerId = null)
        {
            var result = await _mediator.Send(new GetListBranchQuery(dealerId));
            if (result.IsSuccess)
                return Ok(result.Value);
            else
                return BadRequest(result.Errors);
        }
    }
}
