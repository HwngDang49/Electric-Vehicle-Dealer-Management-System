using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Promotions.GetApplicable
{
    public class GetApplicablePromotionsHandler 
        : IRequestHandler<GetApplicablePromotionsCommand, Result<GetApplicablePromotionsResponse>>
    {
        private readonly EVDmsDbContext _db;

        public GetApplicablePromotionsHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<GetApplicablePromotionsResponse>> Handle(
            GetApplicablePromotionsCommand request, 
            CancellationToken ct)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Tìm các promotions active hiện tại
            var applicablePromotions = await _db.Promotions
                .Where(p => 
                    p.Status == PromotionStatus.Active &&
                    p.EffectiveFrom <= today &&
                    (p.EffectiveTo == null || p.EffectiveTo >= today) &&
                    (p.DealerId == null || p.DealerId == request.DealerId)
                )
                .Include(p => p.PromotionScopes)
                .ToListAsync(ct);

            // Filter theo product_id qua promotion_scopes
            var validPromotions = applicablePromotions
                .Where(p => 
                    !p.PromotionScopes.Any() || 
                    p.PromotionScopes.Any(ps => ps.ProductId == null || ps.ProductId == request.ProductId)
                )
                .ToList();

            // Tính tổng discount dựa trên stacking rules
            decimal totalDiscount = 0;
            var exclusivePromotions = validPromotions
                .Where(p => p.StackingRule == StackingRule.Exclusive)
                .ToList();

            if (exclusivePromotions.Any())
            {
                totalDiscount = exclusivePromotions.Max(p => p.AmountOff);
            }
            else
            {
                totalDiscount = validPromotions.Sum(p => p.AmountOff);
            }

            // Map to response
            var promotionDetails = validPromotions.Select(p => new ApplicablePromotionDetail
            {
                PromotionId = p.PromotionId,
                Name = p.Name,
                Description = p.Description,
                FundedBy = p.FundedBy.ToString(),
                AmountOff = p.AmountOff,
                StackingRule = p.StackingRule.ToString(),
                EffectiveFrom = p.EffectiveFrom,
                EffectiveTo = p.EffectiveTo
            }).ToList();

            var response = new GetApplicablePromotionsResponse
            {
                ProductId = request.ProductId,
                TotalDiscount = totalDiscount,
                Promotions = promotionDetails
            };

            return Result.Success(response);
        }
    }
}

