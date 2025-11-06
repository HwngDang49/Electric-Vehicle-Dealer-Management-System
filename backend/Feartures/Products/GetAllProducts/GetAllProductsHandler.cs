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

            // PRIORITY: Per-dealer > Global
            // 1. Tìm per-dealer pricebook trước
            var perDealerPricebook = await _dbContext.Pricebooks
                .Include(pb => pb.PricebookItems)
                    .ThenInclude(pi => pi.Product)
                .Where(pb => pb.DealerId == dealerId &&
                           pb.Status == "Active" &&
                           pb.EffectiveFrom <= today &&
                           (pb.EffectiveTo == null || pb.EffectiveTo >= today))
                .OrderByDescending(pb => pb.EffectiveFrom)
                .FirstOrDefaultAsync(ct);

            Pricebook? activePricebook = perDealerPricebook;

            // 2. Nếu không có per-dealer, fallback sang global pricebook
            if (activePricebook == null)
            {
                activePricebook = await _dbContext.Pricebooks
                    .Include(pb => pb.PricebookItems)
                        .ThenInclude(pi => pi.Product)
                    .Where(pb => pb.DealerId == null && // Global
                               pb.Status == "Active" &&
                               pb.EffectiveFrom <= today &&
                               (pb.EffectiveTo == null || pb.EffectiveTo >= today))
                    .OrderByDescending(pb => pb.EffectiveFrom)
                    .FirstOrDefaultAsync(ct);
            }

            // 3. Nếu không có active pricebook, trả về danh sách rỗng
            if (activePricebook == null)
            {
                return Result.Success(new List<GetAllProductsQuery>());
            }

            // 4. Lấy các products từ pricebook items, chỉ lấy products có status = "Active"
            var productIds = activePricebook.PricebookItems
                .Select(pi => pi.ProductId)
                .Distinct()
                .ToList();

            var products = await _dbContext.Products
                .Where(p => productIds.Contains(p.ProductId) && p.Status == "Active")
                .OrderBy(p => p.ProductId)
                .ProjectTo<GetAllProductsQuery>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result.Success(products);
        }
    }
}
