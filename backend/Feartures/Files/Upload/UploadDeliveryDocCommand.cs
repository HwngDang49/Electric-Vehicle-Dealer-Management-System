using MediatR;
using Microsoft.AspNetCore.Http;

namespace backend.Feartures.Files.Upload
{
    public sealed record UploadDeliveryDocCommand : IRequest<Ardalis.Result.Result<string>>
    {
        public required IFormFile File { get; init; }
    }
}
