using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Promotions.Update
{
    public class UpdatePromotionHandler : IRequestHandler<UpdatePromotionCommand, Result>
    {
        private readonly EVDmsDbContext _dbContext;

        public UpdatePromotionHandler(EVDmsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Result> Handle(UpdatePromotionCommand command, CancellationToken ct)
        {
            var promotion = await _dbContext.Promotions
                .FirstOrDefaultAsync(p => p.PromotionId == command.PromotionId, ct);

            if (promotion == null)
            {
                return Result.NotFound("Không tìm thấy promotion");
            }

            // Chỉ cho phép update khi status = Draft
            if (promotion.Status != PromotionStatus.Draft)
            {
                return Result.Error($"Chỉ có thể update promotion khi status là Draft. Hiện tại: {promotion.Status}");
            }

            var req = command.Request;

            // Validate dates
            if (req.EffectiveTo.HasValue && req.EffectiveFrom >= req.EffectiveTo.Value)
            {
                return Result.Error("Ngày kết thúc phải sau ngày bắt đầu");
            }

            // Validate dealer exists (nếu có)
            if (req.DealerId.HasValue)
            {
                var dealerExists = await _dbContext.Dealers
                    .AnyAsync(d => d.DealerId == req.DealerId.Value && d.Status == DealerStatus.Live.ToString(), ct);

                if (!dealerExists)
                {
                    return Result.Error($"Dealer ID {req.DealerId.Value} không tồn tại hoặc không active");
                }
            }

            // Check duplicate name
            var duplicateName = await _dbContext.Promotions
                .Where(p => p.Name == req.Name && 
                           p.DealerId == req.DealerId && 
                           p.PromotionId != command.PromotionId)
                .AnyAsync(ct);

            if (duplicateName)
            {
                var scope = req.DealerId.HasValue ? $"dealer ID {req.DealerId.Value}" : "hệ thống (OEM)";
                return Result.Error($"Đã tồn tại promotion với tên '{req.Name}' trong {scope}");
            }

            // Update promotion
            promotion.Name = req.Name;
            promotion.Description = req.Description;
            promotion.DealerId = req.DealerId;
            promotion.FundedBy = req.FundedBy;
            promotion.StackingRule = req.StackingRule;
            promotion.AmountOff = req.AmountOff;
            promotion.EffectiveFrom = req.EffectiveFrom;
            promotion.EffectiveTo = req.EffectiveTo;

            await _dbContext.SaveChangesAsync(ct);

            return Result.Success();
        }
    }

    public class UpdatePromotionStatusHandler : IRequestHandler<UpdatePromotionStatusCommand, Result>
    {
        private readonly EVDmsDbContext _dbContext;

        public UpdatePromotionStatusHandler(EVDmsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Result> Handle(UpdatePromotionStatusCommand command, CancellationToken ct)
        {
            var promotion = await _dbContext.Promotions
                .FirstOrDefaultAsync(p => p.PromotionId == command.PromotionId, ct);

            if (promotion == null)
            {
                return Result.NotFound("Không tìm thấy promotion");
            }

            var newStatus = command.Request.Status;

            // Validate status transition
            var validTransition = IsValidStatusTransition(promotion.Status, newStatus);
            if (!validTransition)
            {
                return Result.Error($"Không thể chuyển từ {promotion.Status} sang {newStatus}");
            }

            promotion.Status = newStatus;
            await _dbContext.SaveChangesAsync(ct);

            return Result.Success();
        }

        private bool IsValidStatusTransition(PromotionStatus currentStatus, PromotionStatus newStatus)
        {
            return currentStatus switch
            {
                PromotionStatus.Draft => newStatus == PromotionStatus.Active || newStatus == PromotionStatus.Cancelled,
                PromotionStatus.Active => newStatus == PromotionStatus.Expired || newStatus == PromotionStatus.Cancelled,
                PromotionStatus.Expired => false, // Không thể chuyển từ Expired
                PromotionStatus.Cancelled => false, // Không thể chuyển từ Cancelled
                _ => false
            };
        }
    }
}

