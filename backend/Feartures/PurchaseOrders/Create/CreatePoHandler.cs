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

        public CreatePoHandler(EVDmsDbContext db, IMapper mapper, IHttpContextAccessor http)
        {
            _db = db;
            _mapper = mapper;
            _http = http;
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
                                    .AnyAsync(d => d.DealerId == dealerId
                                            && d.Status == DealerStatus.Live.ToString(), ct);
            if (!dealer) return Result.Error("Dealer status need at Live to create PO");

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

                branchId = branch.BranchId;

                // Nếu là Staff, kiểm tra xem branch có phải của họ không
                if (role != "DealerManager" && branchId != currentUser.BranchId)
                    return Result.Error("DealerStaff only create PO for their own branch");
            }
            else
            {
                // Fallback: dùng branchId từ user
                branchId = currentUser.BranchId;
            }

            // check branchId không null
            if (branchId is null || branchId <= 0)
                return Result.Error("BranchCode or BranchId is required");

            // Chọn status theo role
            var status = role == "DealerManager" ? POStatus.Submit : POStatus.Draft;

            //tạo đơn hàng
            var po = new PurchaseOrder
            {
                DealerId = dealerId ?? 0,
                BranchId = branchId.Value,
                CreateBy = cmd.CurrentUserId,
                SubmittedBy = status == POStatus.Submit ? cmd.CurrentUserId : null,
                CreateAt = DateTime.UtcNow,
                UpdateAt = DateTime.UtcNow,
                Status = status.ToString(),
            };

            // xét đến thời gian hiện tại xem sản phẩm còn hiệu lực không
            var now = DateOnly.FromDateTime(DateTime.UtcNow);

            // Lấy danh sách ID sản phẩm từ request
            var productIds = req.PoItems.Select(p => p.ProductId).Distinct().ToList();

            // gom giá lại
            var priceGroup = await _db.PricebookItems
                            .AsNoTracking()
                            .Include(pbi => pbi.Pricebook)
                            .Where(pbi => productIds.Contains(pbi.ProductId)
                            // active mới cho lấy giá
                            && pbi.Pricebook.Status == "Active"
                            //kiểm coi còn trong thời gian hợp lệ không
                            && pbi.Pricebook.EffectiveFrom <= now
                            && (pbi.Pricebook.EffectiveTo == null || pbi.Pricebook.EffectiveTo >= now))
                            .ToListAsync(ct); //lấy về List 

            var priceRows = priceGroup.ToDictionary
                                    (p => p.ProductId,
                                    p => p.FloorPrice // FloorPrice is now non-nullable (required field)
                                                      // giá trị có dạng {1 : 5000, 2 , 1000} {key, priceFloor}
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

            _db.PurchaseOrders.Add(po);

            await _db.SaveChangesAsync(ct);

            return Result.Success(po.PoId);
        }
    }
}

