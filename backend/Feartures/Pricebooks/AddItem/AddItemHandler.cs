using Ardalis.Result;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.AddItem
{
    public record AddItemCommand(long PricebookId, AddItemRequest Request) : IRequest<Result<long>>;

    public class AddItemHandler : IRequestHandler<AddItemCommand, Result<long>>
    {
        private readonly EVDmsDbContext _dbContext;

        public AddItemHandler(EVDmsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Result<long>> Handle(AddItemCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // 1. Kiểm tra pricebook tồn tại
            var pricebook = await _dbContext.Pricebooks
                .Include(p => p.PricebookItems)
                .FirstOrDefaultAsync(p => p.PricebookId == cmd.PricebookId, ct);

            if (pricebook == null)
            {
                return Result.NotFound($"Không tìm thấy pricebook với ID {cmd.PricebookId}");
            }

            // 2. Kiểm tra product tồn tại và Active
            var product = await _dbContext.Products
                .FirstOrDefaultAsync(p => p.ProductId == req.ProductId && p.Status == "Active", ct);

            if (product == null)
            {
                return Result.Error($"Không tìm thấy sản phẩm Active với ID {req.ProductId}");
            }

            // 3. Kiểm tra product đã tồn tại trong pricebook chưa
            var existingItem = pricebook.PricebookItems
                .FirstOrDefault(pi => pi.ProductId == req.ProductId);

            if (existingItem != null)
            {
                return Result.Error($"Sản phẩm '{product.Name}' đã tồn tại trong bảng giá này. " +
                    "Vui lòng sử dụng chức năng Update nếu muốn thay đổi giá.");
            }

            // 4. Validate FloorPrice <= MsrpPrice
            if (req.FloorPrice > req.MsrpPrice)
            {
                return Result.Error("Giá sàn không được lớn hơn giá MSRP");
            }

            // 5. Thêm PricebookItem mới
            var newItem = new PricebookItem
            {
                PricebookId = cmd.PricebookId,
                ProductId = req.ProductId,
                MsrpPrice = req.MsrpPrice,
                FloorPrice = req.FloorPrice,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.PricebookItems.Add(newItem);
            await _dbContext.SaveChangesAsync(ct);

            return Result.Success(newItem.PricebookItemId);
        }
    }
}

