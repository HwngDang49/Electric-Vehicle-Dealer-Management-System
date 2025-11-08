using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Products.GetAllProducts
{
    public sealed class GetAllProductsHandler : IRequestHandler<GetAllProductsCommand, Result<List<GetAllProductsQuery>>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetAllProductsHandler(EVDmsDbContext dbContext, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<List<GetAllProductsQuery>>> Handle(GetAllProductsCommand cmd, CancellationToken ct)
        {
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

            // 3. Merge productIds từ dealer và global pricebooks
            var productIds = new HashSet<long>();

            if (perDealerPricebook != null)
            {
                // Thêm tất cả productIds từ dealer pricebook
                var dealerProductIds = perDealerPricebook.PricebookItems
                    .Select(pi => pi.ProductId)
                    .ToHashSet();
                productIds.UnionWith(dealerProductIds);

                // Thêm productIds từ global mà dealer không có
                if (globalPricebook != null)
                {
                    var globalProductIds = globalPricebook.PricebookItems
                        .Select(pi => pi.ProductId)
                        .Where(pid => !dealerProductIds.Contains(pid));
                    productIds.UnionWith(globalProductIds);
                }
            }
            else if (globalPricebook != null)
            {
                // Không có dealer pricebook, lấy tất cả từ global
                var globalProductIds = globalPricebook.PricebookItems
                    .Select(pi => pi.ProductId);
                productIds.UnionWith(globalProductIds);
            }

            // 4. Nếu không có product nào, trả về danh sách rỗng
            if (productIds.Count == 0)
            {
                return Result.Success(new List<GetAllProductsQuery>());
            }

            // 5. Lấy các products từ merged productIds, chỉ lấy products có status = "Active"
            var products = await _dbContext.Products
                .Where(p => productIds.Contains(p.ProductId) && p.Status == "Active")
                .OrderBy(p => p.ProductId)
                .ProjectTo<GetAllProductsQuery>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result.Success(products);
        }
    }
}
