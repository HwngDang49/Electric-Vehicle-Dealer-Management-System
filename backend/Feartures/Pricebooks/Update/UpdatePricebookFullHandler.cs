using Ardalis.Result;
using backend.Common.Auth;
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
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            var req = command.Request;

            // 1. Kiểm tra pricebook tồn tại
            var pricebook = await _dbContext.Pricebooks
                .FirstOrDefaultAsync(pb => pb.PricebookId == command.Id, ct);

            if (pricebook == null)
            {
                return Result.NotFound("Không tìm thấy bảng giá");
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

            // 4. Business Rule: Nếu set thành Active, deactivate tất cả pricebook khác của cùng dealer
            if (req.Status.ToString() == "Active")
            {
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

