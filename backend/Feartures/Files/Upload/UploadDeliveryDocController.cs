using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Files.Upload
{
    [ApiController]
    [Route("api/files")]
    [Authorize]
    public class UploadDeliveryDocController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UploadDeliveryDocController(IMediator mediator) => _mediator = mediator;

        [HttpPost("upload-delivery-doc")]
        public async Task<ActionResult<Result<string>>> UploadDeliveryDoc(
            IFormFile file,
            CancellationToken ct)
        {
            var command = new UploadDeliveryDocCommand { File = file };
            var result = await _mediator.Send(command, ct);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }
    }
}
