using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Inventories.Receive
{
    public record ReceiveInventoryCommand(ReceiveInventoryRequest Request) : IRequest<Result<ReceiveInventoryResponse>>;

    public class ReceiveInventoryResponse
    {
        public long PoId { get; set; }
        public int TotalItemsReceived { get; set; }
        public bool InventoryReceived { get; set; } = true;
        public List<ReceivedItem> ReceivedItems { get; set; } = new();
    }

    public class ReceivedItem
    {
        public long ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public List<string> Vins { get; set; } = new();
    }

    public class ReceiveInventoryHandler : IRequestHandler<ReceiveInventoryCommand, Result<ReceiveInventoryResponse>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ReceiveInventoryHandler(EVDmsDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<ReceiveInventoryResponse>> Handle(ReceiveInventoryCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            // 1. Lấy thông tin PO và kiểm tra quyền
            var po = await _dbContext.PurchaseOrders
                .Include(p => p.PoItems)
                .ThenInclude(pi => pi.Product)
                .Include(p => p.Branch)
                .FirstOrDefaultAsync(p => p.PoId == req.PoId, ct);

            if (po == null)
            {
                return Result.NotFound($"Purchase Order {req.PoId} not found");
            }

            // Kiểm tra quyền dealer
            if (po.DealerId != dealerId)
            {
                return Result.Forbidden($"Dealer {dealerId} not authorized for this PO");
            }

            // Kiểm tra trạng thái PO phải là Delivery
            if (po.Status != POStatus.Delivery.ToString())
            {
                return Result.Error($"PO status must be 'Delivery' to receive inventory. Current status: {po.Status}");
            }

            // 2. Tạo inventory records cho từng item trong PO
            var receivedItems = new List<ReceivedItem>();
            var totalItemsReceived = 0;

            using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
            try
            {
                foreach (var poItem in po.PoItems)
                {
                    var vins = new List<string>();
                    
                    // Tạo VIN cho từng quantity
                    for (int i = 0; i < poItem.Qty; i++)
                    {
                        var vin = await GenerateVinAsync(poItem.ProductId, po.BranchId, DateTime.UtcNow, ct);
                        
                        var inventory = new Inventory
                        {
                            Vin = vin,
                            OwnerType = "Dealer",
                            OwnerId = dealerId,
                            LocationType = "Branch",
                            LocationId = po.BranchId,
                            DealerId = dealerId,
                            BranchId = po.BranchId,
                            ProductId = poItem.ProductId,
                            Status = InventoryStatus.InStock.ToString(),
                            ReceivedAt = DateTime.UtcNow,
                            PoId = po.PoId,
                            CreatedAt = DateTime.UtcNow
                        };

                        _dbContext.Inventories.Add(inventory);
                        vins.Add(vin);
                        totalItemsReceived++;
                    }

                    receivedItems.Add(new ReceivedItem
                    {
                        ProductId = poItem.ProductId,
                        ProductName = poItem.Product?.ModelCode ?? $"Product {poItem.ProductId}",
                        Quantity = poItem.Qty,
                        Vins = vins
                    });
                }

                // 3. Cập nhật trạng thái PO để đánh dấu đã nhập kho
                // Có thể thêm field InventoryReceived vào PO entity nếu cần
                // Hoặc sử dụng status để track: po.Status = "Received";

                await _dbContext.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);

                var response = new ReceiveInventoryResponse
                {
                    PoId = po.PoId,
                    TotalItemsReceived = totalItemsReceived,
                    InventoryReceived = true,
                    ReceivedItems = receivedItems
                };

                return Result.Success(response);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                return Result.Error($"Failed to receive inventory: {ex.Message}");
            }
        }

        private async Task<string> GenerateVinAsync(long productId, long branchId, DateTime timestamp, CancellationToken ct)
        {
            // Tạo VIN dựa trên product info và timestamp
            var product = await _dbContext.Products
                .FirstOrDefaultAsync(p => p.ProductId == productId, ct);
            
            var productCode = product?.ModelCode ?? "UNK";
            var timestampStr = timestamp.ToString("yyyyMMddHHmmss");
            var randomSuffix = new Random().Next(1000, 9999);
            
            return $"{productCode}-{branchId}-{timestampStr}-{randomSuffix}";
        }
    }
}
