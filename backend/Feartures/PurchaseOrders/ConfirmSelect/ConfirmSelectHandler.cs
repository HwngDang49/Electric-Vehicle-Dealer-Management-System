using Ardalis.Result;
using AutoMapper;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Feartures.PurchaseOrders.ConfirmSelect
{
    public record ConfirmSelectCommand(ConfirmSelectRequest Request, long CurrentId) : IRequest<Result>;

    public class ConfirmSelectHandler : IRequestHandler<ConfirmSelectCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        private readonly ILogger<ConfirmSelectHandler> _logger;

        public ConfirmSelectHandler(EVDmsDbContext db, IMapper mapper, ILogger<ConfirmSelectHandler> logger)
        {
            _db = db;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Result> Handle(ConfirmSelectCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // check po tồn tại
            var po = await _db.PurchaseOrders
                .Include(p => p.PoItems)
                .FirstOrDefaultAsync(p => p.PoId == req.PoId, ct);

            if (po is null)
            {
                return Result.NotFound($"PO {req.PoId} not found.");
            }

            // Kiểm tra status ở submit chưa
            if (po.Status != POStatus.Submit.ToString())
            {
                return Result.Error("PO must be Submit status to confirm");
            }

            // Kiểm tra PoItems không
            if (po.PoItems is null || po.PoItems.Count == 0)
            {
                return Result.Error("PO must contain at least 1 line item");
            }

            if (po.PoItems.Any(i => i.Qty <= 0) || po.PoItems.Any(i => i.UnitWholesale < 0))
            {
                return Result.Error("Quantity must be > 0 and UnitPrice ≥ 0");
            }

            // 
            foreach (var poItem in po.PoItems)
            {
                var vinAllocation = req.VinAllocations
                    .FirstOrDefault(v => v.ProductId == poItem.ProductId);

                if (vinAllocation == null)
                {
                    return Result.Error(
                        $"Missing VIN for Product {poItem.ProductId}. "
                    );
                }

                // check số lượng VIN phải khớp với Qty
                if (vinAllocation.SelectedVins.Count != poItem.Qty)
                {
                    return Result.Error(
                        $"Product {poItem.ProductId} requires {poItem.Qty} VINs"
                    );
                }

                // Check trùng VIN trong cùng 1 product
                var duplicateVins = vinAllocation.SelectedVins
                    .GroupBy(v => v)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .ToList();

                if (duplicateVins.Any())
                {
                    return Result.Error(
                        $"Duplicate VIN for Product {poItem.ProductId}: " +
                        $"{string.Join(", ", duplicateVins)}. " +
                        $"Each VIN can only be selected once."
                    );
                }

                // VIN phải tồn tại, available, và thuộc đúng product
                var inventoriesToAllocate = await _db.Inventories
                    .Where(i => vinAllocation.SelectedVins.Contains(i.Vin))
                    .ToListAsync(ct);

                // check xem vin có tồn tại không
                if (inventoriesToAllocate.Count != vinAllocation.SelectedVins.Count)
                {
                    var foundVins = inventoriesToAllocate.Select(i => i.Vin).ToList();
                    var missingVins = vinAllocation.SelectedVins
                        .Except(foundVins)
                        .ToList();

                    return Result.Error(
                        $"VINs not found in inventory: {string.Join(", ", missingVins)}"
                    );
                }

                // VIN có available không
                var unavailableVins = inventoriesToAllocate
                    .Where(i => i.OwnerType != "Manufacturer"
                             || i.Status != InventoryStatus.InStock.ToString()) // Phải InStock và thuộc Manufacturer
                    .Select(i => $"{i.Vin} (Status: {i.Status}, Owner: {i.OwnerType})")
                    // dòng này nó sẽ select ra những VIN không InStock hoặc không thuộc Manufacturer
                    .ToList();

                if (unavailableVins.Any())
                {
                    return Result.Error(
                        $"Some VINs are not available for allocation: " +
                        string.Join(", ", unavailableVins)
                    );
                }

                // check VIN có đúng với product ko
                var wrongProductVins = inventoriesToAllocate
                    .Where(i => i.ProductId != poItem.ProductId)
                    .Select(i => $"{i.Vin} (belongs to Product {i.ProductId})")
                    .ToList();

                if (wrongProductVins.Any())
                {
                    return Result.Error(
                        $"VINs belong to wrong product: " +
                        string.Join(", ", wrongProductVins) +
                        $" (Expected Product {poItem.ProductId})"
                    );
                }
            }

            // check xem có VIN nào bị chọn cho nhiều product khác nhau ko
            var allSelectedVins = req.VinAllocations
                .SelectMany(v => v.SelectedVins)
                .ToList();

            var duplicateAcrossProducts = allSelectedVins
                .GroupBy(v => v)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicateAcrossProducts.Any())
            {
                return Result.Error(
                    $"Same VIN selected for multiple products: " +
                    string.Join(", ", duplicateAcrossProducts)
                );
            }

            // Kiểm tra dealer
            var dealer = await _db.Dealers.FirstOrDefaultAsync(d => d.DealerId == po.DealerId, ct);
            if (dealer is null)
            {
                return Result.Error($"Dealer {po.DealerId} not found.");
            }

            // Kiểm tra credit available
            var poTotal = po.PoItems.Sum(i => i.LineTotal);
            if (poTotal > dealer.CreditAvailable)
            {
                return Result.Error($"Dealer {po.DealerId} exceed limit");
            }

            // Allocate VINs

            foreach (var poItem in po.PoItems)
            {
                var vinAllocation = req.VinAllocations
                    .First(v => v.ProductId == poItem.ProductId);

                var inventoriesToAllocate = await _db.Inventories
                    .Where(i => vinAllocation.SelectedVins.Contains(i.Vin))
                    .ToListAsync(ct);

                foreach (var inventory in inventoriesToAllocate)
                {
                    inventory.Status = InventoryStatus.Allocated.ToString();
                    inventory.PoId = po.PoId;
                }
            }

            // Update PO status
            po.ApprovedBy = cmd.CurrentId;
            po.ConfirmedBy = cmd.CurrentId;
            po.Status = POStatus.Confirm.ToString();
            po.UpdateAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
    }
}

