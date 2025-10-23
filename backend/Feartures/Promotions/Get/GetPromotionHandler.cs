using Ardalis.Result;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Promotions.Get
{
    public class GetPromotionHandler : IRequestHandler<GetPromotionCommand, Result<GetPromotionQuery>>
    {
        private readonly EVDmsDbContext _dbContext;

        public GetPromotionHandler(EVDmsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Result<GetPromotionQuery>> Handle(GetPromotionCommand command, CancellationToken ct)
        {
            var promotion = await _dbContext.Promotions
                .Include(p => p.Dealer)
                .Include(p => p.PromotionScopes)
                .FirstOrDefaultAsync(p => p.PromotionId == command.PromotionId, ct);

            if (promotion == null)
            {
                return Result.NotFound($"Không tìm thấy promotion với ID {command.PromotionId}");
            }

            // Lấy thông tin Products và Branches cho scopes
            var productIds = promotion.PromotionScopes
                .Where(s => s.ProductId.HasValue)
                .Select(s => s.ProductId!.Value)
                .Distinct()
                .ToList();

            var branchIds = promotion.PromotionScopes
                .Where(s => s.BranchId.HasValue)
                .Select(s => s.BranchId!.Value)
                .Distinct()
                .ToList();

            var productDict = productIds.Any()
                ? await _dbContext.Products
                    .Where(p => productIds.Contains(p.ProductId))
                    .ToDictionaryAsync(p => p.ProductId, p => p.Name, ct)
                : new Dictionary<long, string>();

            var branchDict = branchIds.Any()
                ? await _dbContext.Branches
                    .Where(b => branchIds.Contains(b.BranchId))
                    .ToDictionaryAsync(b => b.BranchId, b => b.Name, ct)
                : new Dictionary<long, string>();

            var result = new GetPromotionQuery
            {
                PromotionId = promotion.PromotionId,
                DealerId = promotion.DealerId,
                DealerName = promotion.Dealer?.Name ?? "Global (OEM)",
                Name = promotion.Name,
                Description = promotion.Description,
                FundedBy = promotion.FundedBy.ToString(),
                StackingRule = promotion.StackingRule.ToString(),
                AmountOff = promotion.AmountOff,
                EffectiveFrom = promotion.EffectiveFrom,
                EffectiveTo = promotion.EffectiveTo,
                Status = promotion.Status.ToString(),
                CreatedAt = promotion.CreatedAt,
                CreatedBy = promotion.CreatedBy,
                Scopes = promotion.PromotionScopes.Select(s => new PromotionScopeDetail
                {
                    PromotionScopeId = s.PromotionScopeId,
                    ProductId = s.ProductId,
                    ProductName = s.ProductId.HasValue && productDict.ContainsKey(s.ProductId.Value)
                        ? productDict[s.ProductId.Value] 
                        : null,
                    BranchId = s.BranchId,
                    BranchName = s.BranchId.HasValue && branchDict.ContainsKey(s.BranchId.Value)
                        ? branchDict[s.BranchId.Value] 
                        : null
                }).ToList()
            };

            return Result.Success(result);
        }
    }
}

