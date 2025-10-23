using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace backend.Feartures.Files.Upload
{
    public sealed class UploadFileCommand : IRequest<Result<string>>
    {
        public IFormFile File { get; set; } = null!;
    }
}

