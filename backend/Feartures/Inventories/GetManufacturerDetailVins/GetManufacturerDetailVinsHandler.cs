using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Inventories.GetManufacturerDetailVins
{
    public class GetManufacturerDetailVinsHandler : IRequestHandler<GetManufacturerDetailVinsQuery, List<ManufacturerDetailVinDto>>
    {
        private readonly EVDmsDbContext _dbContext;

        public GetManufacturerDetailVinsHandler(EVDmsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<ManufacturerDetailVinDto>> Handle(GetManufacturerDetailVinsQuery query, CancellationToken ct)
        {
            // Lấy inventory của hãng (OwnerType = "Manufacturer")
            var inventoriesQuery = _dbContext.Inventories
                .AsNoTracking()
                .Include(i => i.Product)
                .Where(i => i.OwnerType == "Manufacturer");

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

            // Filter theo Color (màu sắc trong Product)
            if (!string.IsNullOrWhiteSpace(query.Color))
            {
                inventoriesQuery = inventoriesQuery.Where(i => i.Product.ColorName == query.Color);
            }

            var inventories = await inventoriesQuery
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new ManufacturerDetailVinDto
                {
                    Vin = i.Vin,
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ColorName = i.Product.ColorName,
                    Status = i.Status,
                    ReceivedAt = i.ReceivedAt,
                    OrderId = i.OrderId,
                    PoId = i.PoId
                })
                .ToListAsync(ct);

            return inventories;
        }
    }
}

