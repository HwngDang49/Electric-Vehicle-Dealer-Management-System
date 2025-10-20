using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.Delivery.Issue
{
    public sealed record IssueDeliveryCommand(IssueDeliveryRequest Request) : IRequest<Result>;

    public sealed class IssueDeliveryHandler : IRequestHandler<IssueDeliveryCommand, Result>
    {
        private readonly EVDmsDbContext _db;

        public IssueDeliveryHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result> Handle(IssueDeliveryCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // kiểm tra xem po tồn tại không
            var po = await _db.PurchaseOrders
                .Include(p => p.PoItems)
                .FirstOrDefaultAsync(p => p.PoId == req.PoId, ct);
            if (po is null) return Result.NotFound($"PO {req.PoId} not found");

            // check status
            if (po.Status != POStatus.Confirm.ToString())
                return Result.Error("PO must be Confirm to issue delivery");

            // Phải có hóa đơn
            var hasInvoice = await _db.Invoices.AsNoTracking() //read-only
                .AnyAsync(i => i.PoId == req.PoId && i.InvoiceType == "B2B", ct);
            if (!hasInvoice)
                return Result.Error("B2B invoice is required before delivery");

            // số lượng vin phải đủ cho product
            foreach (var poItem in po.PoItems)
            {
                var allocatedCount = await _db.Inventories
                    .Where(inv => inv.ProductId == poItem.ProductId // check id
                                  && inv.OwnerType == "Manufacturer" // phải thuộc về hãng
                                  && inv.Status == InventoryStatus.Allocated.ToString() // phải đang allocated
                                  && inv.PoId == po.PoId)
                    .CountAsync(ct);
                if (allocatedCount < poItem.Qty)
                {
                    return Result.Error($"not enough allocated VIN for product {poItem.ProductId}. Required {poItem.Qty}, allocated {allocatedCount}.");
                }
            }

            // Lấy toàn bộ VIN đang Allocated cho PO
            var inventories = await _db.Inventories
                .Where(inv => inv.PoId == po.PoId
                              && inv.OwnerType == "Manufacturer"
                              && inv.Status == InventoryStatus.Allocated.ToString())
                .ToListAsync(ct);
            if (inventories.Count == 0)
                return Result.Error("No allocated VIN to deliver");

            foreach (var inv in inventories)
            {
                inv.Status = InventoryStatus.InTransit.ToString();
                inv.LocationType = "OnRoad"; // vẫn đang của Manufacturer
            }

            po.UpdateAt = DateTimeHelper.UtcNow();

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}


