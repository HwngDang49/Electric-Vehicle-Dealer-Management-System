using System;
using System.Buffers.Text;
using System.IO;
using System.Linq;
using System.Security.Claims;
using Ardalis.Result;
using AutoMapper;
using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using backend.Infrastructure.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.Create
{
    public record CreatePoCommand(CreatePoRequest Request, long CurrentUserId) : IRequest<Result<long>>;
    public class CreatePoHandler : IRequestHandler<CreatePoCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _http;
        private readonly NotificationService _notificationService;

        public CreatePoHandler(EVDmsDbContext db, IMapper mapper, IHttpContextAccessor http, NotificationService notificationService)
        {
            _db = db;
            _mapper = mapper;
            _http = http;
            _notificationService = notificationService;
        }

        public async Task<Result<long>> Handle(CreatePoCommand cmd, CancellationToken ct)
        {

            var req = cmd.Request;
            var userId = _http.HttpContext?.User?.GetUserId();
            var dealerId = _http.HttpContext?.User?.GetDealerId();
            var role = _http.HttpContext?.User?.GetRole();



            var currentUser = await _db.Users
                                    .AsNoTracking()
                                    .FirstOrDefaultAsync(u => u.UserId == userId, ct);

            if (currentUser is null)
                return Result.NotFound("User not found");

            // check dealer
            var dealer = await _db.Dealers
                                    .FirstOrDefaultAsync(d => d.DealerId == dealerId, ct);
            if (dealer is null) return Result.Error($"Dealer {dealerId} not found");
            if (dealer.Status != DealerStatus.Live.ToString())
                return Result.Error("Dealer status need at Live to create PO");

            // Xác định BranchId dựa trên BranchCode hoặc role
            long? branchId;

            if (!string.IsNullOrEmpty(req.BranchCode))
            {
                // Tìm branch theo code

                var branch = await _db.Branches
                    .FirstOrDefaultAsync(b => b.Code == req.BranchCode
                                           && b.DealerId == dealerId, ct);


                if (branch == null)
                    return Result.NotFound($"Branch code '{req.BranchCode}' not found or does not belong to dealer");

                // Kiểm tra branch status phải là Active
                if (branch.Status != BranchStatus.Active.ToString())
                    return Result.Error($"Branch '{req.BranchCode}' is not active. Current status: {branch.Status}");

                branchId = branch.BranchId;

                // Nếu là Staff, kiểm tra xem branch có phải của họ không
                if (role != "DealerManager" && branchId != currentUser.BranchId)
                    return Result.Error("DealerStaff only create PO for their own branch");
            }
            else
            {
                // Fallback: dùng branchId từ user
                branchId = currentUser.BranchId;

                // Nếu dùng branchId từ user, cần check branch status
                if (branchId.HasValue && branchId.Value > 0)
                {
                    var userBranch = await _db.Branches
                        .FirstOrDefaultAsync(b => b.BranchId == branchId.Value && b.DealerId == dealerId, ct);

                    if (userBranch == null)
                        return Result.NotFound($"Branch with ID {branchId.Value} not found or does not belong to dealer");

                    // Kiểm tra branch status phải là Active
                    if (userBranch.Status != BranchStatus.Active.ToString())
                        return Result.Error($"Branch '{userBranch.Code}' is not active. Current status: {userBranch.Status}");
                }
            }

            // check branchId không null
            if (branchId is null || branchId <= 0)
                return Result.Error("BranchCode or BranchId is required");

            // Check dealerId có giá trị hợp lệ
            if (!dealerId.HasValue || dealerId.Value <= 0)
                return Result.Error("DealerId is required");

            // Chọn status theo role
            var status = role == "DealerManager" ? POStatus.Submit : POStatus.Draft;

            //tạo đơn hàng
            var po = new PurchaseOrder
            {
                DealerId = dealerId.Value,
                BranchId = branchId.Value,
                CreateBy = cmd.CurrentUserId,
                SubmittedBy = status == POStatus.Submit ? cmd.CurrentUserId : null,
                CreateAt = DateTime.UtcNow,
                UpdateAt = DateTime.UtcNow,
                Status = status.ToString(),
                ExpectedDate = req.ExpectedDate,
            };

            // xét đến thời gian hiện tại xem sản phẩm còn hiệu lực không
            var now = DateOnly.FromDateTime(DateTime.UtcNow);

            // Lấy danh sách ID sản phẩm từ request
            var productIds = req.PoItems.Select(p => p.ProductId).Distinct().ToList();

            // Kiểm tra tất cả sản phẩm phải Active - không cho tạo PO với sản phẩm inactive
            var products = await _db.Products
                .AsNoTracking()
                .Where(p => productIds.Contains(p.ProductId))
                .Select(p => new { p.ProductId, p.Name, p.Status })
                .ToListAsync(ct);

            // Kiểm tra xem có sản phẩm nào không tồn tại
            var foundProductIds = products.Select(p => p.ProductId).ToList();
            var missingProductIds = productIds.Except(foundProductIds).ToList();
            if (missingProductIds.Any())
            {
                return Result.Error("Products not found");
            }

            // Kiểm tra xem có sản phẩm nào không Active
            var inactiveProducts = products
                .Where(p => p.Status != ProductStatus.Active.ToString())
                .Select(p => $"Product {p.ProductId} ({p.Name}) - Status: {p.Status}")
                .ToList();

            if (inactiveProducts.Any())
            {
                return Result.Error($"Cannot create PO with inactive products. " +
                    $"Only Active products are allowed. Inactive products: {string.Join("; ", inactiveProducts)}");
            }

            // gom giá lại - ưu tiên pricebook của dealer trước, sau đó global
            // PRIORITY: Dealer-specific > Global, sau đó theo EffectiveFrom (mới nhất trước)
            var priceGroup = await _db.PricebookItems
                            .AsNoTracking()
                            .Include(pbi => pbi.Pricebook)
                            .Where(pbi => productIds.Contains(pbi.ProductId)
                            // active mới cho lấy giá
                            && pbi.Pricebook.Status == "Active"
                            //kiểm coi còn trong thời gian hợp lệ không
                            && pbi.Pricebook.EffectiveFrom <= now
                            && (pbi.Pricebook.EffectiveTo == null || pbi.Pricebook.EffectiveTo >= now)
                            // Lấy cả pricebook của dealer và global (DealerId = null)
                            && (pbi.Pricebook.DealerId == dealerId || pbi.Pricebook.DealerId == null))
                            // Ưu tiên: dealer-specific trước (DealerId == dealerId), sau đó global (DealerId == null)
                            // Sử dụng cách so sánh rõ ràng: dealer-specific = 1, global = 0
                            // Trong cùng mức ưu tiên, chọn pricebook mới nhất (EffectiveFrom lớn nhất)
                            // Nếu EffectiveFrom giống nhau, dùng CreatedAt để đảm bảo stable sort
                            .OrderByDescending(pbi => pbi.Pricebook.DealerId.HasValue && pbi.Pricebook.DealerId == dealerId ? 1 : 0)
                            .ThenByDescending(pbi => pbi.Pricebook.EffectiveFrom)
                            // .ThenByDescending(pbi => pbi.Pricebook.CreatedAt)
                            .ToListAsync(ct); //lấy về List 

            // Group theo ProductId và lấy giá từ pricebook có độ ưu tiên cao nhất cho mỗi product
            // Tránh lỗi duplicate key khi một product có giá trong nhiều pricebook
            var priceRows = priceGroup
                            .GroupBy(p => p.ProductId)
                            .ToDictionary(
                                g => g.Key,
                                g => g.First().FloorPrice // Lấy giá từ pricebook có độ ưu tiên cao nhất (đã được order sẵn)
                            );

            //tạo từng line để add vô
            foreach (var item in req.PoItems)
            {
                // Kiểm tra xem productId có trong priceRows không (tránh KeyNotFoundException)
                if (!priceRows.TryGetValue(item.ProductId, out var unitPrice))
                {
                    Console.WriteLine($"[CreatePoHandler] ERROR: ProductId {item.ProductId} not found in priceRows");
                    return Result.Error($"Product with ID {item.ProductId} does not have a valid price in any active pricebook");
                }

                if (unitPrice == 0)
                {
                    return Result.Error($"Product with ID {item.ProductId} has invalid price (0) in pricebook");
                }

                po.PoItems.Add(new PoItem
                {
                    ProductId = item.ProductId,
                    Qty = item.Qty,
                    // lấy giá được map qua gắn váo
                    UnitWholesale = unitPrice,
                    LineTotal = unitPrice * item.Qty
                });
            }

            po.TotalAmount = po.PoItems.Sum(i => i.LineTotal);

            // kiểm tra xem trong đơn có hàng không
            if (req.PoItems.Count <= 0) return Result.Error("does not product apper in po");

            // Kiểm tra credit limit trước khi tạo PO
            var poTotal = po.TotalAmount ?? 0;
            if (poTotal > dealer.CreditAvailable)
            {
                return Result.Error($"PO total {poTotal:n0} exceeds available credit. " +
                    $"Credit used: {dealer.CreditUsed:n0}, Credit limit: {dealer.CreditLimit:n0}, " +
                    $"Available: {dealer.CreditAvailable:n0}");
            }

            _db.PurchaseOrders.Add(po);

            await _db.SaveChangesAsync(ct);

            // Send notification to EVM Staff if PO is submitted (status = Submit)
            if (status == POStatus.Submit)
            {
                try
                {
                    var poCode = $"PO{po.PoId}";
                    var dealerName = dealer.Name ?? $"Dealer {dealer.DealerId}";
                    await _notificationService.NotifyNewPurchaseOrder(
                        po.PoId,
                        poCode,
                        dealer.DealerId,
                        dealerName,
                        po.TotalAmount ?? 0,
                        po.CreateAt
                    );
                }
                catch (Exception ex)
                {
                    // Log error but don't fail the PO creation
                    Console.WriteLine($"[CreatePoHandler] Error sending notification: {ex.Message}");
                }
            }

            return Result.Success(po.PoId);
        }
    }
}

