using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Promotions.GetAll
{
    public class GetAllPromotionsHandler : IRequestHandler<GetAllPromotionsCommand, Result<List<GetAllPromotionsQuery>>>
    {
        private readonly EVDmsDbContext _dbContext;

        public GetAllPromotionsHandler(EVDmsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Result<List<GetAllPromotionsQuery>>> Handle(GetAllPromotionsCommand command, CancellationToken ct)
        {
            var query = _dbContext.Promotions
                .Include(p => p.Dealer)
                .Include(p => p.PromotionScopes)
                .AsQueryable();

            // Filter by DealerId
            if (command.DealerId.HasValue)
            {
                query = query.Where(p => p.DealerId == command.DealerId.Value);
            }

            // Filter by Status
            if (!string.IsNullOrEmpty(command.Status))
            {
                if (Enum.TryParse<PromotionStatus>(command.Status, out var statusFilter))
                {
                    query = query.Where(p => p.Status == statusFilter);
                }
            }

            // Filter by EffectiveDate (promotions active on that date)
            if (command.EffectiveDate.HasValue)
            {
                var date = command.EffectiveDate.Value;
                query = query.Where(p => 
                    p.EffectiveFrom <= date && 
                    (p.EffectiveTo == null || p.EffectiveTo >= date)
                );
            }

            var promotions = await query
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new GetAllPromotionsQuery
                {
                    PromotionId = p.PromotionId,
                    DealerId = p.DealerId,
                    DealerName = p.Dealer != null ? p.Dealer.Name : "Global (OEM)",
                    Name = p.Name,
                    Description = p.Description,
                    FundedBy = p.FundedBy.ToString(),
                    StackingRule = p.StackingRule.ToString(),
                    AmountOff = p.AmountOff,
                    EffectiveFrom = p.EffectiveFrom,
                    EffectiveTo = p.EffectiveTo,
                    Status = p.Status.ToString(),
                    CreatedAt = p.CreatedAt,
                    ScopeCount = p.PromotionScopes.Count
                })
                .ToListAsync(ct);

            return Result.Success(promotions);
        }
    }
}

