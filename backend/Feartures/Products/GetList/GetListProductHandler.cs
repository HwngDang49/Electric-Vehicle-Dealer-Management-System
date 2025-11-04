using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Feartures.Branches.GetListBranch;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Products.GetList
{
    public record GetListProductCommand(bool OnlyInPricebook = false) : IRequest<Result<List<GetListProductQuery>>>;
    public class GetListProductHandler
        : IRequestHandler<GetListProductCommand, Result<List<GetListProductQuery>>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetListProductHandler(EVDmsDbContext dbContext, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<List<GetListProductQuery>>> Handle(GetListProductCommand cmd, CancellationToken ct)
        {
            
            // Nếu OnlyInPricebook = true, chỉ lấy products có trong pricebook
            if (cmd.OnlyInPricebook)
            {
                // Lấy dealerId từ context
                long? dealerId = null;
                try
                {
                    dealerId = _httpContextAccessor.HttpContext?.User?.GetDealerId();
                }
                catch
                {
                    // Nếu không có dealer context, chỉ lấy global pricebooks
                }

                var today = DateOnly.FromDateTime(DateTime.UtcNow);

                // Lấy tất cả ProductId từ PricebookItems của các pricebook:
                // - Chỉ lấy pricebook có DealerId = NULL (global) HOẶC DealerId = dealer hiện tại
                // - Status = "Active"
                // - Trong khoảng effective date
                var productIdsInPricebooks = await _dbContext.PricebookItems
                    .Include(pi => pi.Pricebook)
                    .Where(pi =>
                        pi.Pricebook.Status == "Active" &&
                        pi.Pricebook.EffectiveFrom <= today &&
                        (pi.Pricebook.EffectiveTo == null || pi.Pricebook.EffectiveTo >= today) &&
                        // Chỉ lấy pricebook global (DealerId = null) hoặc của dealer hiện tại
                        (pi.Pricebook.DealerId == null || (dealerId.HasValue && pi.Pricebook.DealerId == dealerId)))
                    .Select(pi => pi.ProductId)
                    .Distinct()
                    .ToListAsync(ct);

                Console.WriteLine($"[GetListProductHandler] Found {productIdsInPricebooks.Count} products in pricebook (DealerId: {dealerId})");

                // Nếu không có products nào trong pricebook, trả về empty list
                if (productIdsInPricebooks.Count == 0)
                {
                    Console.WriteLine("[GetListProductHandler] No products found in pricebook, returning empty list");
                    return Result.Success(new List<GetListProductQuery>());
                }

                // Chỉ lấy products có ProductId trong danh sách pricebook items
                var products = await _dbContext.Products
                    .Where(p => productIdsInPricebooks.Contains(p.ProductId))
                    .OrderBy(p => p.ProductId)
                    .ProjectTo<GetListProductQuery>(_mapper.ConfigurationProvider)
                    .ToListAsync(ct);

                return Result.Success(products);
            }

            // Mặc định: Return ALL products (không filter)
            var allProducts = await _dbContext.Products
                // .Where(p => p.Status == "Active") // Temporarily disabled
                .OrderBy(p => p.ProductId)
                .ProjectTo<GetListProductQuery>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result.Success(allProducts);
        }
    }
}
