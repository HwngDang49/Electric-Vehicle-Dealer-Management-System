using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.GetActive
{
    public sealed class GetActivePricebookHandler : IRequestHandler<GetActivePricebookCommand, Result<GetActivePricebookQuery>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetActivePricebookHandler(EVDmsDbContext dbContext, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<GetActivePricebookQuery>> Handle(GetActivePricebookCommand cmd, CancellationToken ct)
        {
            // This endpoint is for dealer/staff operations only
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // 1. Tìm per-dealer pricebook
            var perDealerPricebook = await _dbContext.Pricebooks
                .Include(pb => pb.PricebookItems)
                    .ThenInclude(pi => pi.Product)
                .Where(pb => pb.DealerId == dealerId &&
                           pb.Status == "Active" &&
                           pb.EffectiveFrom <= today &&
                           (pb.EffectiveTo == null || pb.EffectiveTo >= today))
                .OrderByDescending(pb => pb.EffectiveFrom)
                .FirstOrDefaultAsync(ct);

            // 2. Tìm global pricebook (luôn tìm để merge items nếu cần)
            var globalPricebook = await _dbContext.Pricebooks
                .Include(pb => pb.PricebookItems)
                    .ThenInclude(pi => pi.Product)
                .Where(pb => pb.DealerId == null && // Global
                           pb.Status == "Active" &&
                           pb.EffectiveFrom <= today &&
                           (pb.EffectiveTo == null || pb.EffectiveTo >= today))
                .OrderByDescending(pb => pb.EffectiveFrom)
                .FirstOrDefaultAsync(ct);

            // 3. Nếu có per-dealer pricebook, merge với global items
            if (perDealerPricebook != null)
            {
                if (globalPricebook != null)
                {
                    // Merge logic: Lấy tất cả items từ dealer, thêm items từ global mà dealer không có
                    var dealerProductIds = perDealerPricebook.PricebookItems
                        .Select(pi => pi.ProductId)
                        .ToHashSet();

                    // Lấy items từ global mà dealer không có
                    var globalItemsToAdd = globalPricebook.PricebookItems
                        .Where(pi => !dealerProductIds.Contains(pi.ProductId))
                        .ToList();

                    // Tạo merged items list: dealer items + global items (mà dealer không có)
                    var mergedItems = perDealerPricebook.PricebookItems
                        .Select(pi => MapToItemQuery(pi))
                        .Concat(globalItemsToAdd.Select(pi => MapToItemQuery(pi)))
                        .ToList();

                    // Trả về pricebook của dealer nhưng với items đã merge
                    var result = new GetActivePricebookQuery
                    {
                        PricebookId = perDealerPricebook.PricebookId,
                        Name = perDealerPricebook.Name,
                        EffectiveFrom = perDealerPricebook.EffectiveFrom,
                        EffectiveTo = perDealerPricebook.EffectiveTo,
                        Status = perDealerPricebook.Status,
                        CreatedAt = perDealerPricebook.CreatedAt,
                        Items = mergedItems
                    };

                    return Result.Success(result);
                }
                else
                {
                    // Chỉ có dealer pricebook, không có global
                    return BuildResult(perDealerPricebook);
                }
            }

            // 4. Nếu không có per-dealer, chỉ trả về global pricebook
            if (globalPricebook == null)
            {
                return Result.Error("Không có pricebook nào đang active hiện tại.");
            }

            return BuildResult(globalPricebook);
        }

        private Result<GetActivePricebookQuery> BuildResult(Pricebook pricebook)
        {
            var result = new GetActivePricebookQuery
            {
                PricebookId = pricebook.PricebookId,
                Name = pricebook.Name,
                EffectiveFrom = pricebook.EffectiveFrom,
                EffectiveTo = pricebook.EffectiveTo,
                Status = pricebook.Status,
                CreatedAt = pricebook.CreatedAt,
                Items = pricebook.PricebookItems.Select(pi => MapToItemQuery(pi)).ToList()
            };

            return Result.Success(result);
        }

        private static GetActivePricebookItemQuery MapToItemQuery(PricebookItem pi)
        {
            return new GetActivePricebookItemQuery
            {
                PricebookItemId = pi.PricebookItemId,
                ProductId = pi.ProductId,
                ProductName = pi.Product.Name,
                ModelCode = pi.Product.ModelCode!,
                VariantCode = pi.Product.VariantCode!,
                MsrpPrice = pi.MsrpPrice,
                FloorPrice = pi.FloorPrice
            };
        }
    }
}
