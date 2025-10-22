using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Promotions.Delete
{
    public class DeletePromotionHandler : IRequestHandler<DeletePromotionCommand, Result>
    {
        private readonly EVDmsDbContext _dbContext;

        public DeletePromotionHandler(EVDmsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Result> Handle(DeletePromotionCommand command, CancellationToken ct)
        {
            var promotion = await _dbContext.Promotions
                .Include(p => p.PromotionScopes)
                .FirstOrDefaultAsync(p => p.PromotionId == command.PromotionId, ct);

            if (promotion == null)
            {
                return Result.NotFound("Không tìm thấy promotion");
            }

            // Chỉ cho phép xóa khi status = Draft
            if (promotion.Status != PromotionStatus.Draft)
            {
                return Result.Error($"Chỉ có thể xóa promotion khi status là Draft. Hiện tại: {promotion.Status}");
            }

            // Xóa scopes trước
            if (promotion.PromotionScopes.Any())
            {
                _dbContext.PromotionScopes.RemoveRange(promotion.PromotionScopes);
            }

            // Xóa promotion
            _dbContext.Promotions.Remove(promotion);
            await _dbContext.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}

