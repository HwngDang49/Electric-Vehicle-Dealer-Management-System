using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.Update
{
    public class UpdatePricebookFullHandler : IRequestHandler<UpdatePricebookFullCommand, Result>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdatePricebookFullHandler(EVDmsDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result> Handle(UpdatePricebookFullCommand command, CancellationToken ct)
        {
            // ✅ Handle Admin users (may not have dealerId)
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();
            long? dealerId = null;
            
            // Only get dealerId if user is not Admin
            if (userRole != Role.Admin.ToString())
            {
                try
                {
                    dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
                }
                catch (UnauthorizedAccessException)
                {
                    return Result.Error("Dealer context is required for this operation.");
                }
            }

            var req = command.Request;

            // 1. Kiểm tra pricebook tồn tại
            var pricebook = await _dbContext.Pricebooks
                .Include(pb => pb.PricebookItems)
                .FirstOrDefaultAsync(pb => pb.PricebookId == command.Id, ct);

            if (pricebook == null)
            {
                return Result.NotFound("Không tìm thấy bảng giá");
            }

            // ✅ Validate ownership: Admin can update all, others can only update their dealer's pricebooks
            if (dealerId.HasValue && pricebook.DealerId != dealerId.Value)
            {
                return Result.Error("Bảng giá không thuộc về dealer của bạn");
            }

            // 2. Validate dates
            if (req.EffectiveTo.HasValue && req.EffectiveFrom >= req.EffectiveTo.Value)
            {
                return Result.Error("Ngày kết thúc phải sau ngày bắt đầu");
            }

            // 3. Check for overlapping pricebooks (nếu thay đổi dates hoặc dealerId)
            var hasOverlap = await _dbContext.Pricebooks
                .Where(pb => pb.PricebookId != command.Id)
                .Where(pb => pb.Status == "Active")
                .Where(pb => pb.DealerId == req.DealerId) // Same scope
                .Where(pb =>
                    (pb.EffectiveFrom <= req.EffectiveFrom && (!pb.EffectiveTo.HasValue || pb.EffectiveTo >= req.EffectiveFrom)) ||
                    (pb.EffectiveFrom <= req.EffectiveTo && (!pb.EffectiveTo.HasValue || pb.EffectiveTo >= req.EffectiveTo)) ||
                    (pb.EffectiveFrom >= req.EffectiveFrom && (!req.EffectiveTo.HasValue || pb.EffectiveFrom <= req.EffectiveTo))
                )
                .AnyAsync(ct);

            if (hasOverlap && req.Status.ToString() == "Active")
            {
                var scope = req.DealerId.HasValue ? $"dealer ID {req.DealerId.Value}" : "toàn hệ thống (global)";
                return Result.Error($"Đã tồn tại bảng giá Active trong khung thời gian này cho {scope}");
            }

            // 4. Business Rule: Chỉ cho phép activate khi pricebook đã có đủ tất cả product đang active
            if (req.Status.ToString() == "Active")
            {
                // 4.1. Lấy tất cả product đang active
                var allActiveProductIds = await _dbContext.Products
                    .Where(p => p.Status == "Active")
                    .Select(p => p.ProductId)
                    .ToListAsync(ct);

                // 4.2. Lấy tất cả productId trong pricebook items
                var pricebookProductIds = pricebook.PricebookItems
                    .Select(pi => pi.ProductId)
                    .ToList();

                // 4.3. Kiểm tra xem có product nào active nhưng không có trong pricebook không
                var missingProductIds = allActiveProductIds.Except(pricebookProductIds).ToList();

                if (missingProductIds.Any())
                {
                    // Lấy tên các product thiếu để hiển thị trong error message
                    var missingProducts = await _dbContext.Products
                        .Where(p => missingProductIds.Contains(p.ProductId))
                        .Select(p => new { p.ProductId, p.Name })
                        .ToListAsync(ct);

                    var missingProductNames = missingProducts.Select(p => p.Name).ToList();
                    var missingCount = missingProductIds.Count;

                    var errorMessage = missingCount == 1
                        ? $"⚠️ Không thể kích hoạt bảng giá!\n\nBảng giá này chỉ có {pricebookProductIds.Count} sản phẩm nhưng hệ thống đang có {allActiveProductIds.Count} sản phẩm đang hoạt động.\n\nCòn thiếu 1 sản phẩm:\n• {missingProductNames[0]}\n\nVui lòng thêm sản phẩm này vào bảng giá trước khi kích hoạt."
                        : $"⚠️ Không thể kích hoạt bảng giá!\n\nBảng giá này chỉ có {pricebookProductIds.Count} sản phẩm nhưng hệ thống đang có {allActiveProductIds.Count} sản phẩm đang hoạt động.\n\nCòn thiếu {missingCount} sản phẩm:\n{string.Join("\n", missingProductNames.Select((name, idx) => $"• {name}"))}\n\nVui lòng thêm tất cả các sản phẩm này vào bảng giá trước khi kích hoạt.";

                    return Result.Error(errorMessage);
                }

                // 4.4. Business Rule: Nếu set thành Active, deactivate tất cả pricebook khác của cùng dealer
                var activePricebooks = await _dbContext.Pricebooks
                    .Where(p => p.DealerId == req.DealerId &&
                               p.Status == "Active" &&
                               p.PricebookId != command.Id)
                    .ToListAsync(ct);

                foreach (var activePb in activePricebooks)
                {
                    activePb.Status = "Inactive";
                }
            }

            // 5. Update pricebook
            pricebook.Name = req.Name;
            pricebook.DealerId = req.DealerId;
            pricebook.EffectiveFrom = req.EffectiveFrom;
            pricebook.EffectiveTo = req.EffectiveTo;
            pricebook.Status = req.Status.ToString();

            await _dbContext.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}

