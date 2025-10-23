using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Inventories.GetManufacturerInventory
{
    public class GetManufacturerInventoryHandler : IRequestHandler<GetManufacturerInventoryQuery, List<ManufacturerInventoryDto>>
    {
        private readonly EVDmsDbContext _dbContext;

        public GetManufacturerInventoryHandler(EVDmsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<ManufacturerInventoryDto>> Handle(GetManufacturerInventoryQuery query, CancellationToken ct)
        {
            // Lấy tất cả inventory thuộc hãng (OwnerType = "Manufacturer")
            var inventoriesQuery = _dbContext.Inventories
                .AsNoTracking()
                .Include(i => i.Product)
                .Where(i => i.OwnerType == "Manufacturer");

            // Filter theo SearchTerm
            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                var searchTerm = query.SearchTerm.ToLower();
                inventoriesQuery = inventoriesQuery.Where(i =>
                    i.Product.Name.ToLower().Contains(searchTerm) ||
                    i.Product.ModelCode.ToLower().Contains(searchTerm)
                );
            }

            // Filter theo ProductId
            if (query.ProductId.HasValue)
            {
                inventoriesQuery = inventoriesQuery.Where(i => i.ProductId == query.ProductId.Value);
            }

            // Filter theo Status
            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                inventoriesQuery = inventoriesQuery.Where(i => i.Status == query.Status);
            }

            // Lấy tất cả inventories
            var inventories = await inventoriesQuery
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync(ct);

            // Group theo ProductId
            var groupedByProduct = inventories
                .GroupBy(i => i.ProductId)
                .ToList();

            var result = new List<ManufacturerInventoryDto>();

            foreach (var group in groupedByProduct)
            {
                var productInventories = group.ToList();
                var firstItem = productInventories.First();

                // Tính toán số lượng theo trạng thái
                var totalQuantity = productInventories.Count;
                var inStockQuantity = productInventories.Count(i => i.Status == "InStock");
                var allocatedQuantity = productInventories.Count(i => i.Status == "Allocated");
                var readyQuantity = productInventories.Count(i => i.Status == "Ready");
                var deliveredQuantity = productInventories.Count(i => i.Status == "Delivered");

                result.Add(new ManufacturerInventoryDto
                {
                    ProductId = firstItem.ProductId,
                    ProductName = firstItem.Product.Name,
                    ProductCode = firstItem.Product.ModelCode,
                    QuantityInfo = new ManufacturerQuantityInfo
                    {
                        TotalQuantity = totalQuantity,
                        InStockQuantity = inStockQuantity,
                        AllocatedQuantity = allocatedQuantity,
                        ReadyQuantity = readyQuantity,
                        DeliveredQuantity = deliveredQuantity
                    },
                    LastUpdated = productInventories.Max(i => i.CreatedAt)
                });
            }

            return result.OrderByDescending(r => r.LastUpdated).ToList();
        }
    }
}

