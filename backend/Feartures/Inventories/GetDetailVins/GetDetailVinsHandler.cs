using backend.Common.Auth;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Inventories.GetDetailVins
{
    public class GetDetailVinsHandler : IRequestHandler<GetDetailVinsQuery, List<DetailVinDto>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetDetailVinsHandler(
            EVDmsDbContext dbContext,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<DetailVinDto>> Handle(GetDetailVinsQuery query, CancellationToken ct)
        {
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            // Query inventory của dealer - chỉ lấy xe có OwnerType = "Dealer"
            var inventoriesQuery = _dbContext.Inventories
                .AsNoTracking()
                .Include(i => i.Product)
                .Include(i => i.Branch)
                .Where(i => i.DealerId == dealerId && i.OwnerType == "Dealer");

            // Filter theo BranchId
            if (query.BranchId.HasValue)
            {
                inventoriesQuery = inventoriesQuery.Where(i => i.BranchId == query.BranchId.Value);
            }

            // Filter theo Status
            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                inventoriesQuery = inventoriesQuery.Where(i => i.Status == query.Status);
            }

            // Filter theo ProductId
            if (query.ProductId.HasValue)
            {
                inventoriesQuery = inventoriesQuery.Where(i => i.ProductId == query.ProductId.Value);
            }

            // Lấy danh sách và map sang DTO
            var inventories = await inventoriesQuery
                .OrderByDescending(i => i.ReceivedAt)
                .Select(i => new DetailVinDto
                {
                    Vin = i.Vin,
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ColorName = i.Product.ColorName,
                    Status = i.Status,
                    ReceivedAt = i.ReceivedAt,
                    OrderId = i.OrderId,
                    PoId = i.PoId,
                    BranchId = i.BranchId,
                    BranchCode = i.Branch != null ? i.Branch.Code : null,
                    BranchName = i.Branch != null ? i.Branch.Name : null
                })
                .ToListAsync(ct);

            return inventories;
        }
    }
}

