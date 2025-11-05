using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.GetActivePricebook
{
    public sealed class GetPoActivePricebookHandler : IRequestHandler<GetPoActivePricebookCommand, Result<GetPoActivePricebookQuery>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetPoActivePricebookHandler(EVDmsDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<GetPoActivePricebookQuery>> Handle(GetPoActivePricebookCommand cmd, CancellationToken ct)
        {
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // 1. Lấy pricebook items từ thuộc về dealer
            var dealerPricebookItems = await _dbContext.PricebookItems
                .AsNoTracking()
                .Include(pbi => pbi.Pricebook)
                .Include(pbi => pbi.Product)
                .Where(pbi => pbi.Pricebook.DealerId == dealerId &&
                             pbi.Pricebook.Status == "Active" &&
                             pbi.Pricebook.EffectiveFrom <= today &&
                             (pbi.Pricebook.EffectiveTo == null || pbi.Pricebook.EffectiveTo >= today))
                .Select(pbi => new GetPoActivePricebookItemQuery
                {
                    PricebookItemId = pbi.PricebookItemId,
                    ProductId = pbi.ProductId,
                    ProductName = pbi.Product.Name,
                    ModelCode = pbi.Product.ModelCode!,
                    VariantCode = pbi.Product.VariantCode!,
                    MsrpPrice = pbi.MsrpPrice,
                    FloorPrice = pbi.FloorPrice,
                    PricebookId = pbi.PricebookId,
                    IsDealerSpecific = true
                })
                .ToListAsync(ct);

            // 2. Lấy pricebook items từ global pricebook (nếu có)
            var globalPricebookItems = await _dbContext.PricebookItems
                .AsNoTracking()
                .Include(pbi => pbi.Pricebook)
                .Include(pbi => pbi.Product)
                .Where(pbi => pbi.Pricebook.DealerId == null &&
                             pbi.Pricebook.Status == "Active" &&
                             pbi.Pricebook.EffectiveFrom <= today &&
                             (pbi.Pricebook.EffectiveTo == null || pbi.Pricebook.EffectiveTo >= today))
                .Select(pbi => new GetPoActivePricebookItemQuery
                {
                    PricebookItemId = pbi.PricebookItemId,
                    ProductId = pbi.ProductId,
                    ProductName = pbi.Product.Name,
                    ModelCode = pbi.Product.ModelCode!,
                    VariantCode = pbi.Product.VariantCode!,
                    MsrpPrice = pbi.MsrpPrice,
                    FloorPrice = pbi.FloorPrice,
                    PricebookId = pbi.PricebookId,
                    IsDealerSpecific = false
                })
                .ToListAsync(ct);

            // 3. Merge: Lấy tất cả từ dealer, sau đó thêm những items từ global mà không có trong dealer
            var dealerProductIds = dealerPricebookItems.Select(item => item.ProductId).ToHashSet();
            var globalItemsToAdd = globalPricebookItems.Where(item => !dealerProductIds.Contains(item.ProductId)).ToList();

            var mergedItems = dealerPricebookItems.Concat(globalItemsToAdd).ToList();

            var result = new GetPoActivePricebookQuery
            {
                Items = mergedItems
            };

            return Result.Success(result);
        }
    }
}
