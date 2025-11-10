using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Files.Upload
{
    [ApiController]
    [Route("api/files")]
    [Authorize]
    public class UploadFileController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UploadFileController(IMediator mediator) => _mediator = mediator;

        [HttpPost("upload")]
        public async Task<ActionResult<Result<string>>> UploadFile(
            IFormFile file,
            CancellationToken ct)
        {
            var command = new UploadFileCommand { File = file };
            var result = await _mediator.Send(command, ct);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("upload-product-image")]
        public async Task<ActionResult<Result<string>>> UploadProductImage(
            IFormFile file,
            CancellationToken ct)
        {
            var command = new UploadProductImageCommand { File = file };
            var result = await _mediator.Send(command, ct);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }
    }
}

