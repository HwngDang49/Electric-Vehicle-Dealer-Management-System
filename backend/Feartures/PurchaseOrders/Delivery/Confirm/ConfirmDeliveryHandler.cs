using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using backend.Infrastructure.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.Delivery.Confirm
{
    public sealed record ConfirmDeliveryCommand(ConfirmDeliveryRequest Request, long CurrentUserId) : IRequest<Result>;

    public sealed class ConfirmDeliveryHandler : IRequestHandler<ConfirmDeliveryCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        private readonly NotificationService _notificationService;

        public ConfirmDeliveryHandler(EVDmsDbContext db, NotificationService notificationService)
        {
            _db = db;
            _notificationService = notificationService;
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
            if (!dealerId.HasValue)
                return Result.Error("Current user does not have a DealerId assigned");

            var dealerIdValue = dealerId.Value;

            // Kiểm tra dealer phải khớp
            if (dealerIdValue != po.DealerId)
                return Result.Error("Current user can not edit in dealer");

            // Xác định branchId:
            // - Nếu là DealerStaff: dùng branchId của user (phải khớp với PO)
            // - Nếu là DealerManager: dùng branchId từ PO (có thể nhập cho bất kỳ branch nào trong dealer)
            long? branchId;
            if (currentUser.Role == "DealerStaff")
            {
                branchId = currentUser.BranchId;
                if (!branchId.HasValue)
                    return Result.Error("DealerStaff must have a BranchId assigned");
                if (branchId != po.BranchId)
                    return Result.Error("Staff can only receive inventory for their own branch");
            }
            else
            {
                // DealerManager: sử dụng branchId từ PO để nhập đúng kho
                branchId = po.BranchId;
            }

            // Validate branchId: Phải có giá trị và branch phải tồn tại, thuộc về dealer đúng
            if (!branchId.HasValue || branchId.Value <= 0)
                return Result.Error($"Invalid BranchId: {branchId}. PO must have a valid BranchId to receive inventory");

            // Verify branch exists and belongs to the dealer
            var branch = await _db.Branches
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.BranchId == branchId.Value && b.DealerId == dealerIdValue, ct);

            if (branch == null)
                return Result.Error($"Branch with ID {branchId.Value} not found or does not belong to dealer {dealerIdValue}. Cannot receive inventory to this branch");

            // Optional: Check branch status is active (uncomment if needed)
            // if (branch.Status != BranchStatus.Active.ToString())
            //     return Result.Error($"Branch {branchId.Value} is not active. Cannot receive inventory");

            // Lấy toàn bộ VIN đang InTransit cho PO
            var inventories = await _db.Inventories
                .Where(inv => inv.PoId == po.PoId
                              && inv.OwnerType == "Manufacturer"
                              && inv.Status == InventoryStatus.InTransit.ToString())
                .ToListAsync(ct);

            if (inventories.Count == 0) return Result.Error("No in-transit VIN to confirm");
            //Không tìm thấy VIN đang InTransit thuộc PO này ⇒ không thể Confirm ⇒ trả lỗi và dừng.

            var receivedAt = DateTimeHelper.UtcNow();
            // branchId đã được validate ở trên, chắc chắn có giá trị
            var branchIdValue = branchId.Value;

            foreach (var inv in inventories)
            {
                inv.Status = InventoryStatus.InStock.ToString();
                inv.OwnerType = "Dealer";
                inv.DealerId = dealerIdValue;
                inv.BranchId = branchIdValue; // Đã validate, không null
                inv.LocationType = "Branch";
                inv.LocationId = branchIdValue; // Nhập vào branch, không phải dealer

                // Set received timestamp when inventory is received at branch
                inv.ReceivedAt = receivedAt;
            }

            // chuyeern dodior status
            po.Status = POStatus.Delivery.ToString();
            po.UpdateAt = DateTimeHelper.UtcNow();
            await _db.SaveChangesAsync(ct);

            // Send real-time notification to dealer about new VINs received
            var vinList = inventories.Select(inv => inv.Vin).ToList();
            await _notificationService.NotifyVinsReceived(dealerIdValue, inventories.Count, vinList);

            // Check if any of these VINs match backordered orders and notify
            foreach (var inv in inventories)
            {
                // Check if there are any backordered orders for this product
                // Order doesn't have ProductId directly, need to check through OrderItems
                var backorderedOrders = await _db.Orders
                    .Include(o => o.OrderItems)
                    .Where(o => o.DealerId == dealerIdValue
                             && o.BranchId == branchIdValue
                             && o.Status == OrderStatus.Backordered.ToString()
                             && o.OrderItems.Any(oi => oi.ProductId == inv.ProductId))
                    .ToListAsync(ct);

                foreach (var order in backorderedOrders)
                {
                    await _notificationService.NotifyVinAvailableForDealer(
                        dealerIdValue,
                        inv.Vin,
                        inv.ProductId,
                        order.OrderId);
                }
            }

            return Result.Success();
        }
    }
}


