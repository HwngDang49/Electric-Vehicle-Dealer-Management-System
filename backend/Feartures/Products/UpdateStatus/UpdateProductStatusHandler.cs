using Ardalis.Result;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Products.UpdateStatus
{
    public sealed class UpdateProductStatusHandler : IRequestHandler<UpdateProductStatusCommand, Result>
    {
        private readonly EVDmsDbContext _db;

        public UpdateProductStatusHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result> Handle(UpdateProductStatusCommand request, CancellationToken ct)
        {
            var product = await _db.Products
                .FirstOrDefaultAsync(p => p.ProductId == request.ProductId, ct);

            if (product == null)
            {
                return Result.NotFound($"Product with ID {request.ProductId} not found.");
            }

            // Business Rule: Không cho phép inactive product nếu product đang trong active pricebook
            if (request.Status == ProductStatus.Inactive || request.Status == ProductStatus.Discontinued)
            {
                var today = DateOnly.FromDateTime(DateTime.UtcNow);

                var activePricebookItems = await _db.PricebookItems
                    .Include(pbi => pbi.Pricebook)
                    .Where(pbi => pbi.ProductId == request.ProductId)
                    .Where(pbi =>
                        pbi.Pricebook.Status == PricebookStatus.Active.ToString() &&
                        pbi.Pricebook.EffectiveFrom <= today &&
                        (pbi.Pricebook.EffectiveTo == null || pbi.Pricebook.EffectiveTo >= today))
                    .ToListAsync(ct);

                if (activePricebookItems.Any())
                {
                    // Trả về lỗi với thông tin các pricebooks
                    var pricebookNames = activePricebookItems
                        .Select(pbi => pbi.Pricebook.Name)
                        .Distinct()
                        .ToList();

                    return Result.Error(
                        $"Không thể {GetStatusLabel(request.Status)} sản phẩm '{product.Name}' vì sản phẩm này đang được sử dụng trong {activePricebookItems.Count} bảng giá đang hoạt động: {string.Join(", ", pricebookNames)}. " +
                        "Vui lòng inactive hoặc xóa sản phẩm khỏi bảng giá trước khi thay đổi trạng thái sản phẩm."
                    );
                }
            }

            product.Status = request.Status.ToString();

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }

        private string GetStatusLabel(ProductStatus status)
        {
            return status switch
            {
                ProductStatus.Inactive => "ngừng hoạt động",
                ProductStatus.Discontinued => "ngừng sản xuất",
                _ => "thay đổi trạng thái"
            };
        }
    }
}
