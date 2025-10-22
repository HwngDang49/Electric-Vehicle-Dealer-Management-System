using Ardalis.Result;
using backend.Common.Auth;
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
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            // 1. Kiểm tra pricebook tồn tại và thuộc dealer
            var pricebook = await _dbContext.Pricebooks
                .FirstOrDefaultAsync(pb => pb.PricebookId == request.PricebookId, ct);

            if (pricebook == null)
            {
                return Result.NotFound("Không tìm thấy bảng giá");
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
            await _dbContext.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}

