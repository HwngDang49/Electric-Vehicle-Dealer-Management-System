using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Helpers;
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

            // 2.1. Check unique constraint: (DealerId, Name, EffectiveFrom)
            // Xử lý cả trường hợp DealerId null (global pricebook)
            var duplicatePricebook = await _dbContext.Pricebooks
                .Where(pb => pb.PricebookId != command.Id &&
                           pb.Name == req.Name &&
                           pb.EffectiveFrom == req.EffectiveFrom &&
                           ((req.DealerId == null && pb.DealerId == null) || (req.DealerId != null && pb.DealerId == req.DealerId)))
                .FirstOrDefaultAsync(ct);

            if (duplicatePricebook != null)
            {
                var scope = req.DealerId.HasValue ? $"dealer ID {req.DealerId.Value}" : "toàn hệ thống (global)";
                return Result.Error($"Đã tồn tại bảng giá khác với tên '{req.Name}' và ngày bắt đầu {req.EffectiveFrom:dd/MM/yyyy} cho {scope}. Vui lòng chọn tên hoặc ngày bắt đầu khác.");
            }

            // 3. Business Rule: Validate khi activate pricebook
            if (req.Status.ToString() == "Active")
            {
                // 3.0. Kiểm tra pricebook đã đến ngày hiệu lực chưa
                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                if (req.EffectiveFrom > today)
                {
                    return Result.Error($"Không thể kích hoạt bảng giá! Bảng giá này có ngày bắt đầu là {req.EffectiveFrom:dd/MM/yyyy}, chưa đến ngày hiệu lực. Chỉ có thể kích hoạt khi đã đến ngày bắt đầu.");
                }

                // 3.4. Check for overlapping pricebooks - Pricebook đã đến ngày hiệu lực nên check overlap
                var overlappingPricebooks = await _dbContext.Pricebooks
                    .Where(pb => pb.PricebookId != command.Id)
                    .Where(pb => pb.Status == "Active")
                    .Where(pb => pb.DealerId == req.DealerId) // Same scope
                    .ToListAsync(ct);

                foreach (var existingPb in overlappingPricebooks)
                {
                    var newStart = req.EffectiveFrom;
                    var newEnd = req.EffectiveTo ?? DateOnly.MaxValue;
                    var oldStart = existingPb.EffectiveFrom;
                    var oldEnd = existingPb.EffectiveTo ?? DateOnly.MaxValue;

                    // Overlap nếu: (newStart <= oldEnd) AND (newEnd >= oldStart)
                    if (newStart <= oldEnd && newEnd >= oldStart)
                    {
                        var scope = req.DealerId.HasValue ? $"dealer ID {req.DealerId.Value}" : "toàn hệ thống (global)";
                        return Result.Error($"Đã tồn tại bảng giá Active ({existingPb.Name}) trong khung thời gian này cho {scope}. " +
                            $"Bảng giá hiện tại: {oldStart:dd/MM/yyyy} - {(oldEnd == DateOnly.MaxValue ? "không giới hạn" : oldEnd.ToString("dd/MM/yyyy"))}. " +
                            $"Bảng giá mới: {newStart:dd/MM/yyyy} - {(newEnd == DateOnly.MaxValue ? "không giới hạn" : newEnd.ToString("dd/MM/yyyy"))}.");
                    }
                }

                // 3.5. Business Rule: Deactivate pricebook khác khi có overlap thời gian
                foreach (var activePb in overlappingPricebooks)
                {
                    // Kiểm tra overlap: chỉ inactive nếu có overlap thời gian
                    var newStart = req.EffectiveFrom;
                    var newEnd = req.EffectiveTo ?? DateOnly.MaxValue;
                    var oldStart = activePb.EffectiveFrom;
                    var oldEnd = activePb.EffectiveTo ?? DateOnly.MaxValue;

                    // Overlap nếu: (newStart <= oldEnd) AND (newEnd >= oldStart)
                    if (newStart <= oldEnd && newEnd >= oldStart)
                    {
                        activePb.Status = "Inactive";
                    }
                }
            }

            // 4. Update pricebook
            try
            {
                pricebook.Name = req.Name;
                pricebook.DealerId = req.DealerId;
                pricebook.EffectiveFrom = req.EffectiveFrom;
                pricebook.EffectiveTo = req.EffectiveTo;
                pricebook.Status = req.Status.ToString();
                pricebook.UpdatedAt = DateTimeHelper.UtcNow();

                await _dbContext.SaveChangesAsync(ct);

                return Result.Success();
            }
            catch (Exception ex)
            {
                return Result.Error($"Lỗi khi cập nhật bảng giá: {ex.Message}");
            }
        }
    }
}

