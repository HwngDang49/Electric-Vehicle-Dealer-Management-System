using Ardalis.Result;
using AutoMapper;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Inventories.Create
{
    public sealed record CreateInventoryCommand(CreateInventoryRequest Request) : IRequest<Result<CreateInventoryResponse>>;
    public sealed class CreateInventoryHandler
        : IRequestHandler<CreateInventoryCommand, Result<CreateInventoryResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public CreateInventoryHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<CreateInventoryResponse>> Handle(CreateInventoryCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // 1) Validation checks
            // 1.1 Kiểm tra Product tồn tại
            var productExists = await _db.Products
                .AsNoTracking()
                .AnyAsync(p => p.ProductId == req.ProductId, ct);
            if (!productExists)
            {
                return Result.NotFound($"Product {req.ProductId} not found.");
            }

            // Không còn target dealer/branch trong bước tạo

            // 2) Map DTO -> Entity
            var entity = _mapper.Map<Inventory>(req);

            // 3) Set các giá trị mặc định
            entity.Vin = "VIN" + DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            entity.OwnerType = req.OwnerType.ToString();
            entity.OwnerId = req.OwnerId;
            entity.LocationType = req.LocationType.ToString();
            entity.DealerId = null;
            entity.BranchId = null;
            entity.Status = InventoryStatus.InStock.ToString();
            entity.CreatedAt = DateTimeHelper.UtcNow();

            // 4) Save
            _db.Inventories.Add(entity);
            await _db.SaveChangesAsync(ct);

            // 5) Response
            var response = new CreateInventoryResponse
            {
                Vin = entity.Vin,
                Status = entity.Status,
                CreatedAt = entity.CreatedAt,
                ProductId = entity.ProductId,
                ExpectedDeliveryDate = req.ExpectedDeliveryDate,
                NextStep = "Inventory đã được tạo, sẵn sàng để allocate cho dealer"
            };

            return Result.Success(response);
        }
    }
}
