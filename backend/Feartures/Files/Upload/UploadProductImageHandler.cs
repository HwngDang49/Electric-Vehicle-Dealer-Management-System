using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Files.Upload
{
    public sealed class UploadProductImageHandler : IRequestHandler<UploadProductImageCommand, Result<string>>
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UploadProductImageHandler(IWebHostEnvironment environment, IHttpContextAccessor httpContextAccessor)
        {
            _environment = environment;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<string>> Handle(UploadProductImageCommand cmd, CancellationToken ct)
        {
            if (cmd.File == null || cmd.File.Length == 0)
                return Result.Error("Không có file được cung cấp");

            // Validate file type (only images)
            var extension = Path.GetExtension(cmd.File.FileName).ToLowerInvariant();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            
            if (!allowedExtensions.Contains(extension))
                return Result.Error("Chỉ cho phép file ảnh: JPG, JPEG, PNG, WEBP");

            // Validate file size (max 5MB)
            const long maxSize = 5 * 1024 * 1024; // 5MB
            if (cmd.File.Length > maxSize)
                return Result.Error("Kích thước file phải nhỏ hơn 5MB");

            // Validate MIME type
            var allowedMimeTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
            if (!allowedMimeTypes.Contains(cmd.File.ContentType.ToLowerInvariant()))
                return Result.Error("Loại file không hợp lệ. Chỉ chấp nhận file ảnh.");

            try
            {
                // Create uploads/products directory if not exists
                var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads", "products");
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
                var fileUrl = $"{baseUrl}/uploads/products/{uniqueFileName}";

                return Result.Success(fileUrl);
            }
            catch (Exception ex)
            {
                return Result.Error($"Lỗi khi upload file: {ex.Message}");
            }
        }
    }
}

