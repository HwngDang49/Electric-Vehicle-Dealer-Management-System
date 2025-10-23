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

            // Chỉ cho phép update khi status = Draft hoặc Active
            if (promotion.Status != PromotionStatus.Draft && promotion.Status != PromotionStatus.Active)
            {
                return Result.Error($"Không thể update promotion có status {promotion.Status}");
            }

            var req = command.Request;

            // Validate dates
            if (req.EffectiveTo.HasValue && req.EffectiveFrom >= req.EffectiveTo.Value)
            {
                return Result.Error("Ngày kết thúc phải sau ngày bắt đầu");
            }

            // === OPTION A (STRICT): Active promotion - chỉ được update Description và EffectiveTo ===
            if (promotion.Status == PromotionStatus.Active)
            {
                // Validate: Chỉ description và effectiveTo được phép khác
                if (req.Name != promotion.Name ||
                    req.DealerId != promotion.DealerId ||
                    req.FundedBy != promotion.FundedBy ||
                    req.StackingRule != promotion.StackingRule ||
                    req.AmountOff != promotion.AmountOff ||
                    req.EffectiveFrom != promotion.EffectiveFrom)
                {
                    return Result.Error("Promotion đang active chỉ có thể update Description và EffectiveTo");
                }

                // Validate: EffectiveTo chỉ được extend (không được rút ngắn)
                if (req.EffectiveTo.HasValue && promotion.EffectiveTo.HasValue && req.EffectiveTo.Value < promotion.EffectiveTo.Value)
                {
                    return Result.Error("Chỉ được gia hạn promotion, không được rút ngắn");
                }

                // Update chỉ 2 fields được phép
                promotion.Description = req.Description;
                promotion.EffectiveTo = req.EffectiveTo;

                await _dbContext.SaveChangesAsync(ct);
                return Result.Success();
            }

            // === DRAFT: Update tất cả fields ===

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

            // Update promotion (Draft - tất cả fields)
            promotion.Name = req.Name;
            promotion.Description = req.Description;
            promotion.DealerId = req.DealerId;
            promotion.FundedBy = req.FundedBy;
            promotion.StackingRule = req.StackingRule;
            promotion.AmountOff = req.AmountOff;
            promotion.EffectiveFrom = req.EffectiveFrom;
            promotion.EffectiveTo = req.EffectiveTo;

            // Update scopes if provided (DELETE old + INSERT new)
            if (req.Scopes != null)
            {
                // Step 1: DELETE all old scopes
                var oldScopes = await _dbContext.PromotionScopes
                    .Where(ps => ps.PromotionId == command.PromotionId)
                    .ToListAsync(ct);
                
                if (oldScopes.Any())
                {
                    _dbContext.PromotionScopes.RemoveRange(oldScopes);
                }

                // Step 2: INSERT new scopes
                if (req.Scopes.Any())
                {
                    var newScopes = req.Scopes.Select(s => new Domain.Entities.PromotionScope
                    {
                        PromotionId = promotion.PromotionId,
                        ProductId = s.ProductId,
                        BranchId = s.BranchId
                    }).ToList();

                    _dbContext.PromotionScopes.AddRange(newScopes);
                }
                // Note: If req.Scopes is empty [], all scopes are deleted (apply to all by default)
            }

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

