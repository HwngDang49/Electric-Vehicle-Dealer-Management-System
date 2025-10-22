using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Promotions.Create
{
    public class CreatePromotionHandler : IRequestHandler<CreatePromotionCommand, Result<long>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreatePromotionHandler(EVDmsDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<long>> Handle(CreatePromotionCommand command, CancellationToken ct)
        {
            var req = command.Request;
            var now = DateTime.UtcNow;
            var userId = _httpContextAccessor.HttpContext!.User.GetUserId();

            // 1. Validate Dealer exists (nếu có)
            if (req.DealerId.HasValue)
            {
                var dealerExists = await _dbContext.Dealers
                    .AnyAsync(d => d.DealerId == req.DealerId.Value && d.Status == DealerStatus.Live.ToString(), ct);

                if (!dealerExists)
                {
                    return Result.Error($"Dealer ID {req.DealerId.Value} không tồn tại hoặc không active");
                }
            }

            // 2. Check duplicate name
            var duplicateName = await _dbContext.Promotions
                .Where(p => p.Name == req.Name && p.DealerId == req.DealerId)
                .AnyAsync(ct);

            if (duplicateName)
            {
                var scope = req.DealerId.HasValue ? $"dealer ID {req.DealerId.Value}" : "hệ thống (OEM)";
                return Result.Error($"Đã tồn tại promotion với tên '{req.Name}' trong {scope}");
            }

            // 3. Validate Products exist (nếu có)
            if (req.Scopes != null && req.Scopes.Any(s => s.ProductId.HasValue))
            {
                var productIds = req.Scopes
                    .Where(s => s.ProductId.HasValue)
                    .Select(s => s.ProductId!.Value)
                    .Distinct()
                    .ToList();

                var existingProducts = await _dbContext.Products
                    .Where(p => productIds.Contains(p.ProductId) && p.Status == ProductStatus.Active.ToString())
                    .Select(p => p.ProductId)
                    .ToListAsync(ct);

                var missingProducts = productIds.Except(existingProducts).ToList();
                if (missingProducts.Any())
                {
                    return Result.Error($"Không tìm thấy sản phẩm active với ID: {string.Join(", ", missingProducts)}");
                }
            }

            // 4. Validate Branches belong to Dealer (nếu có)
            if (req.Scopes != null && req.Scopes.Any(s => s.BranchId.HasValue))
            {
                if (!req.DealerId.HasValue)
                {
                    return Result.Error("Không thể chỉ định branch cho Global promotion");
                }

                var branchIds = req.Scopes
                    .Where(s => s.BranchId.HasValue)
                    .Select(s => s.BranchId!.Value)
                    .Distinct()
                    .ToList();

                var existingBranches = await _dbContext.Branches
                    .Where(b => branchIds.Contains(b.BranchId) && 
                               b.DealerId == req.DealerId.Value &&
                               b.Status == BranchStatus.Active.ToString())
                    .Select(b => b.BranchId)
                    .ToListAsync(ct);

                var missingBranches = branchIds.Except(existingBranches).ToList();
                if (missingBranches.Any())
                {
                    return Result.Error($"Không tìm thấy branch active thuộc dealer với ID: {string.Join(", ", missingBranches)}");
                }
            }

            // 5. Check overlap với Exclusive promotions (Warning only)
            var hasOverlap = await CheckOverlapAsync(req, ct);
            if (hasOverlap)
            {
                // Note: Trong production có thể return warning để client confirm
                // Hiện tại tôi sẽ log warning nhưng vẫn cho tạo
                Console.WriteLine($"[WARNING] Promotion '{req.Name}' overlaps with existing Exclusive promotion(s)");
            }

            // 6. Create Promotion
            var promotion = new Promotion
            {
                Name = req.Name,
                Description = req.Description,
                DealerId = req.DealerId,
                FundedBy = req.FundedBy,
                StackingRule = req.StackingRule,
                AmountOff = req.AmountOff,
                EffectiveFrom = req.EffectiveFrom,
                EffectiveTo = req.EffectiveTo,
                Status = PromotionStatus.Draft, // Mặc định là Draft
                CreatedAt = now,
                CreatedBy = userId.ToString()
            };

            _dbContext.Promotions.Add(promotion);
            await _dbContext.SaveChangesAsync(ct);

            // 7. Create PromotionScopes (nếu có)
            if (req.Scopes != null && req.Scopes.Any())
            {
                var scopes = req.Scopes.Select(s => new PromotionScope
                {
                    PromotionId = promotion.PromotionId,
                    ProductId = s.ProductId,
                    BranchId = s.BranchId
                }).ToList();

                _dbContext.PromotionScopes.AddRange(scopes);
                await _dbContext.SaveChangesAsync(ct);
            }

            return Result.Success(promotion.PromotionId);
        }

        /// <summary>
        /// Check overlap với Exclusive promotions cùng scope
        /// Updated: Global vs Dealer logic
        /// </summary>
        private async Task<bool> CheckOverlapAsync(CreatePromotionRequest req, CancellationToken ct)
        {
            // Chỉ check nếu promotion mới là Exclusive
            if (req.StackingRule != StackingRule.Exclusive)
            {
                return false;
            }

            // Lấy danh sách promotions có thể conflict (Active hoặc Draft, Exclusive)
            var existingPromotions = await _dbContext.Promotions
                .Include(p => p.PromotionScopes)
                .Where(p => p.Status == PromotionStatus.Active || p.Status == PromotionStatus.Draft)
                .Where(p => p.StackingRule == StackingRule.Exclusive)
                .ToListAsync(ct);

            foreach (var existingPromo in existingPromotions)
            {
                // Check dealer scope match
                if (!DealerScopeMatches(req.DealerId, existingPromo.DealerId))
                {
                    continue; // Khác dealer → không conflict
                }

                // Check date overlap
                var dateOverlaps = DateRangeOverlaps(
                    req.EffectiveFrom, req.EffectiveTo,
                    existingPromo.EffectiveFrom, existingPromo.EffectiveTo
                );

                if (!dateOverlaps) continue;

                // Check scope overlap (product/branch)
                var scopeOverlaps = ScopeOverlaps(req.Scopes, existingPromo.PromotionScopes.ToList());
                if (scopeOverlaps)
                {
                    return true; // Found overlap
                }
            }

            return false;
        }

        /// <summary>
        /// Kiểm tra xem 2 promotion có cùng dealer scope không
        /// </summary>
        private bool DealerScopeMatches(long? dealerId1, long? dealerId2)
        {
            // Case 1: Cả 2 đều Global
            if (dealerId1 == null && dealerId2 == null)
                return true;

            // Case 2: 1 Global, 1 Dealer-specific
            // → Conflict nếu có scope overlap (sẽ check ở bước sau)
            if (dealerId1 == null || dealerId2 == null)
                return true; // Tiếp tục check scope

            // Case 3: Cả 2 đều Dealer-specific
            return dealerId1 == dealerId2;
        }

        private bool DateRangeOverlaps(DateOnly start1, DateOnly? end1, DateOnly start2, DateOnly? end2)
        {
            // end1 = null means indefinite
            var actualEnd1 = end1 ?? DateOnly.MaxValue;
            var actualEnd2 = end2 ?? DateOnly.MaxValue;

            return start1 <= actualEnd2 && actualEnd1 >= start2;
        }

        private bool ScopeOverlaps(List<PromotionScopeDto>? scopes1, List<PromotionScope> scopes2)
        {
            // Nếu 1 trong 2 không có scope (= áp dụng tất cả) → overlap
            if (scopes1 == null || !scopes1.Any())
                return true;
            
            if (!scopes2.Any())
                return true;

            // Check từng scope pair
            foreach (var scope1 in scopes1)
            {
                foreach (var scope2 in scopes2)
                {
                    // Overlap nếu:
                    // - Cùng ProductId (hoặc cả 2 null)
                    // - Cùng BranchId (hoặc cả 2 null)
                    var productMatch = scope1.ProductId == scope2.ProductId || 
                                      scope1.ProductId == null || 
                                      scope2.ProductId == null;

                    var branchMatch = scope1.BranchId == scope2.BranchId || 
                                     scope1.BranchId == null || 
                                     scope2.BranchId == null;

                    if (productMatch && branchMatch)
                    {
                        return true;
                    }
                }
            }

            return false;
        }
    }
}

