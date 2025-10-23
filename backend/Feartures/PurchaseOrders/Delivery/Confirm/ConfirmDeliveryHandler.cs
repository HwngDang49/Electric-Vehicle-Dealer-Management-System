using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.Delivery.Confirm
{
    public sealed record ConfirmDeliveryCommand(ConfirmDeliveryRequest Request, long CurrentUserId) : IRequest<Result>;

    public sealed class ConfirmDeliveryHandler : IRequestHandler<ConfirmDeliveryCommand, Result>
    {
        private readonly EVDmsDbContext _db;

        public ConfirmDeliveryHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result> Handle(ConfirmDeliveryCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // kiểm po xem tồn tại không
            var po = await _db.PurchaseOrders.FirstOrDefaultAsync(p => p.PoId == req.PoId, ct);
            if (po is null) return Result.NotFound($"PO {req.PoId} not found");

            // Kiểm tra status phải là InTransit
            if (po.Status != POStatus.InTransit.ToString())
                return Result.Error($"PO status must be 'InTransit' to confirm delivery. Current status: {po.Status}");

            // chắc chắn đã có invoice rồi 
            var hasInvoice = await _db.Invoices.AsNoTracking()
                .AnyAsync(i => i.PoId == req.PoId && i.InvoiceType == "B2B", ct);
            if (!hasInvoice)
                return Result.Error("B2B invoice is required before delivery");

            // Lấy DealerId/BranchId từ tài khoản
            var currentUser = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == cmd.CurrentUserId, ct);
            if (currentUser is null)
                return Result.NotFound($"User {cmd.CurrentUserId} not found");
            var dealerId = currentUser.DealerId;
            var branchId = currentUser.BranchId;

            if (dealerId != po.DealerId)
                return Result.Error("Current user can not edit in dealer");

            if (branchId != po.BranchId)
                return Result.Error("Current user can not edit in branch");

            // Lấy toàn bộ VIN đang InTransit cho PO
            var inventories = await _db.Inventories
                .Where(inv => inv.PoId == po.PoId
                              && inv.OwnerType == "Manufacturer"
                              && inv.Status == InventoryStatus.InTransit.ToString())
                .ToListAsync(ct);

            if (inventories.Count == 0) return Result.Error("No in-transit VIN to confirm");
            //Không tìm thấy VIN đang InTransit thuộc PO này ⇒ không thể Confirm ⇒ trả lỗi và dừng.

            foreach (var inv in inventories)
            {
                inv.Status = InventoryStatus.InStock.ToString();
                inv.OwnerType = "Dealer";
                inv.LocationId = dealerId;
                inv.DealerId = dealerId;
                inv.BranchId = branchId;
                inv.LocationType = branchId.HasValue ? "Branch" : "Dealer";
            }

            // ✅ Chuyển status PO từ InTransit sang Delivery
            po.Status = POStatus.Delivery.ToString();
            po.UpdateAt = DateTimeHelper.UtcNow();
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}


