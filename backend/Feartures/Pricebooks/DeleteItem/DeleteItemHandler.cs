using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.DeleteItem
{
    public class DeleteItemHandler : IRequestHandler<DeleteItemCommand, Result>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeleteItemHandler(EVDmsDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result> Handle(DeleteItemCommand request, CancellationToken ct)
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

            // 1. Kiểm tra pricebook tồn tại
            var pricebook = await _dbContext.Pricebooks
                .FirstOrDefaultAsync(pb => pb.PricebookId == request.PricebookId, ct);

            if (pricebook == null)
            {
                return Result.NotFound("Không tìm thấy bảng giá");
            }

            // ✅ Validate ownership: Admin can delete items from all pricebooks, others can only delete from their dealer's pricebooks
            if (dealerId.HasValue && pricebook.DealerId != dealerId.Value)
            {
                return Result.Error("Bảng giá không thuộc về dealer của bạn");
            }

            // 2. Kiểm tra item tồn tại và thuộc pricebook
            var item = await _dbContext.PricebookItems
                .FirstOrDefaultAsync(pi => 
                    pi.PricebookItemId == request.ItemId && 
                    pi.PricebookId == request.PricebookId, ct);

            if (item == null)
            {
                return Result.NotFound("Không tìm thấy sản phẩm trong bảng giá");
            }

            // 3. Xóa item
            _dbContext.PricebookItems.Remove(item);
            // Update Pricebook.UpdatedAt when item is deleted
            pricebook.UpdatedAt = DateTimeHelper.UtcNow();
            await _dbContext.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}

