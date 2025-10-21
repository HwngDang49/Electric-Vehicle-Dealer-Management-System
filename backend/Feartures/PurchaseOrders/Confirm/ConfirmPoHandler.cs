using Ardalis.Result;
using AutoMapper;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.Approve
{
    public record ConfirmPoCommand(ConfirmPoRequest Request, long CurrentId) : IRequest<Result<ConfirmPoRequest>>;
    public class ConfirmPoHandler : IRequestHandler<ConfirmPoCommand, Result<ConfirmPoRequest>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public ConfirmPoHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<ConfirmPoRequest>> Handle(ConfirmPoCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            var po = await _db.PurchaseOrders.Include(p => p.PoItems).FirstOrDefaultAsync(p => p.PoId == req.PoId, ct);

            if (po is null) return Result.NotFound($"PO {req.PoId} not found.");

            // Chỉ cho confirm khi đang Submitted
            if (po.Status != POStatus.Submit.ToString())
                return Result.Error("Required ur status is submitted has been confirmed");

            // nếu đơn hàng có list = 0 thì trống không cho confirm
            if (po.PoItems is null || po.PoItems.Count == 0)
                return Result.Error("PO must contain at least 1 line item");

            if (po.PoItems.Any(i => i.Qty <= 0) || po.PoItems.Any(i => i.UnitWholesale < 0))
                return Result.Error("Quantity must be > 0 and UnitPrice ≥ 0");

            // kiểm coi dealer tồn tại không
            var dealer = await _db.Dealers.FirstOrDefaultAsync(d => d.DealerId == po.DealerId, ct);
            if (dealer is null) return Result.Error($"Dealer {po.DealerId} not found.");

            // tổng giá trị đơn hàng trong po
            var poTotal = po.PoItems.Sum(i => i.LineTotal);

            // Kiểm tra credit available
            if (poTotal > dealer.CreditAvailable)
            {
                return Result.Error($"PO total {poTotal:n0} exceeds available credit. " +
                    $"Credit used: {dealer.CreditUsed:n0}, Credit limit: {dealer.CreditLimit:n0}, " +
                    $"Available: {dealer.CreditAvailable:n0}");
            }


            //Manufacturer phải đủ VIN InStock cho từng product
            foreach (var poItem in po.PoItems)
            {
                var available = await _db.Inventories
                    .Where(i => i.ProductId == poItem.ProductId
                                && i.OwnerType == "Manufacturer"
                                && i.Status == InventoryStatus.InStock.ToString())
                    .CountAsync(ct);
                if (available < poItem.Qty)
                {
                    return Result.Error($"not enough inventory for product {poItem.ProductId}. Need {poItem.Qty}, available {available} (InStock, Manufacturer).");
                }
            }

            // ALLOCATE INVENTORY - Chuyển inventory từ InStock -> Allocated và gán PoId
            foreach (var poItem in po.PoItems)
            {
                var inventoriesToAllocate = await _db.Inventories
                    .Where(i => i.ProductId == poItem.ProductId
                                && i.OwnerType == "Manufacturer"
                                && i.LocationType == "Manufacturer"
                                && i.Status == InventoryStatus.InStock.ToString())
                    .OrderBy(i => i.CreatedAt) // FIFO
                    .Take(poItem.Qty) // nếu số lượng là 2 thì lấy đúng 2 cái
                    .ToListAsync(ct);

                if (inventoriesToAllocate.Count != poItem.Qty)
                {
                    return Result.Error($"Inventory not enough to vin for Product {poItem.ProductId}. need {poItem.Qty}, to allocate {inventoriesToAllocate.Count}");
                }

                foreach (var inventory in inventoriesToAllocate)
                {
                    inventory.Status = InventoryStatus.Allocated.ToString();
                    inventory.PoId = po.PoId;
                    // giữ nguyên OwnerType = Manufacturer
                }
            }

            po.ApprovedBy = cmd.CurrentId;
            po.Status = POStatus.Confirm.ToString();
            po.UpdateAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}
