using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Files.Upload
{
    public sealed class UploadFileHandler : IRequestHandler<UploadFileCommand, Result<string>>
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UploadFileHandler(IWebHostEnvironment environment, IHttpContextAccessor httpContextAccessor)
        {
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<string>> Handle(UploadFileCommand cmd, CancellationToken ct)
        {
            if (cmd.File == null || cmd.File.Length == 0)
                return Result.Error("No file provided");

            // Validate file type (only PDF)
            var extension = Path.GetExtension(cmd.File.FileName).ToLowerInvariant();
            if (extension != ".pdf")
                return Result.Error("Only PDF files are allowed");

            // Validate file size (max 10MB)
            if (cmd.File.Length > 10 * 1024 * 1024)
                return Result.Error("File size must be less than 10MB");

            try
            {
                // Create uploads directory if not exists
                var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads", "contracts");
                Directory.CreateDirectory(uploadsFolder);

                // Generate unique filename
                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Save file to disk
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await cmd.File.CopyToAsync(stream, ct);
                }

                // Build URL
                var request = _httpContextAccessor.HttpContext!.Request;
                var baseUrl = $"{request.Scheme}://{request.Host}";
                var fileUrl = $"{baseUrl}/uploads/contracts/{uniqueFileName}";

                return Result.Success(fileUrl);
            }
            catch (Exception ex)
            {
                return Result.Error($"Error uploading file: {ex.Message}");
            }
        }
    }
}

