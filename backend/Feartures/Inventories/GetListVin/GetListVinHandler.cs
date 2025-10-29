using backend.Common.Auth;
using backend.Common.Paging;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Inventories.GetListVin
{
    public class GetListVinHandler : IRequestHandler<GetListVinQuery, List<VinListItemDto>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetListVinHandler(
            EVDmsDbContext dbContext,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<VinListItemDto>> Handle(GetListVinQuery query, CancellationToken ct)
        {
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            // Lấy danh sách chi nhánh của dealer với thông tin inventory
            var branchesQuery = _dbContext.Branches
                .AsNoTracking()
                .Include(b => b.Inventories)
                .ThenInclude(i => i.Product)
                .Where(b => b.DealerId == dealerId);

            // Filter theo SearchTerm
            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                var searchTerm = query.SearchTerm.ToLower();
                branchesQuery = branchesQuery.Where(b =>
                    b.Name.ToLower().Contains(searchTerm) ||
                    b.Code.ToLower().Contains(searchTerm) ||
                    b.Address.ToLower().Contains(searchTerm)
                );
            }

            // Filter theo BranchId
            if (query.BranchId.HasValue)
            {
                branchesQuery = branchesQuery.Where(b => b.BranchId == query.BranchId.Value);
            }

            // Filter theo Status (áp dụng cho inventory trong branch)
            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                branchesQuery = branchesQuery.Where(b => 
                    b.Inventories.Any(i => i.Status == query.Status));
            }

            // Filter theo LocationType
            if (!string.IsNullOrWhiteSpace(query.LocationType))
            {
                branchesQuery = branchesQuery.Where(b => 
                    b.Inventories.Any(i => i.LocationType == query.LocationType));
            }

            // Lấy tất cả branches (không phân trang)
            var branches = await branchesQuery
                .OrderByDescending(b => b.UpdatedAt)
                .ToListAsync(ct);

            // Tạo DTO cho mỗi branch với thông tin số lượng VIN
            var result = new List<VinListItemDto>();

            foreach (var branch in branches)
            {
                // Filter inventories explicitly: chỉ lấy inventory của Dealer tại branch này
                var inventories = branch.Inventories
                    .Where(i => i.OwnerType == "Dealer" 
                             && i.DealerId == dealerId
                             && i.BranchId == branch.BranchId)
                    .ToList();
                
                // Tính toán số lượng theo trạng thái
                var totalQuantity = inventories.Count;
                var inStockQuantity = inventories.Count(i => i.Status == "InStock");
                var allocatedQuantity = inventories.Count(i => i.Status == "Allocated");
                var readyQuantity = inventories.Count(i => i.Status == "Ready");
                var deliveredQuantity = inventories.Count(i => i.Status == "Delivered");

                // Tạo breakdown theo sản phẩm
                var productBreakdown = inventories
                    .GroupBy(i => new { i.ProductId, i.Product.Name, i.Product.ColorName })
                    .Select(g => new ProductQuantityInfo
                    {
                        ProductId = g.Key.ProductId,
                        ProductName = g.Key.Name,
                        ColorName = g.Key.ColorName ?? string.Empty,
                        TotalCount = g.Count(),
                        InStockCount = g.Count(i => i.Status == "InStock"),
                        AllocatedCount = g.Count(i => i.Status == "Allocated"),
                        ReadyCount = g.Count(i => i.Status == "Ready"),
                        DeliveredCount = g.Count(i => i.Status == "Delivered")
                    })
                    .OrderByDescending(p => p.TotalCount)
                    .ToList();

                var vinItem = new VinListItemDto
                {
                    BranchId = branch.BranchId,
                    BranchName = branch.Name,
                    BranchCode = branch.Code,
                    BranchAddress = branch.Address,
                    QuantityInfo = new VinQuantityInfo
                    {
                        TotalQuantity = totalQuantity,
                        InStockQuantity = inStockQuantity,
                        AllocatedQuantity = allocatedQuantity,
                        ReadyQuantity = readyQuantity,
                        DeliveredQuantity = deliveredQuantity,
                        ProductBreakdown = productBreakdown
                    },
                    LastUpdated = branch.UpdatedAt
                };

                result.Add(vinItem);
            }

            return result;
        }
    }

}
