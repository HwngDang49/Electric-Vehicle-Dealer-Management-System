using System.Buffers.Text;
using System.IO;
using System.Security.Claims;
using Ardalis.Result;
using AutoMapper;
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

        public CreatePoHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<long>> Handle(CreatePoCommand cmd, CancellationToken ct)
        {

            var req = cmd.Request;

            // check dealer
            var dealerExists = await _db.Dealers.AnyAsync(d => d.DealerId == req.DealerId, ct);
            if (!dealerExists) return Result.Error("Dealer not found.");

            // Check branch thuộc dealer không
            var branchOfDealer = await _db.Branches.AnyAsync(b => b.BranchId == req.BranchId && b.DealerId == req.DealerId, ct);

            if (!branchOfDealer) return Result.Error("Branch does not exits in dealer");



            //tạo đơn hàng
            var po = new PurchaseOrder
            {
                DealerId = req.DealerId,
                BranchId = req.BranchId,
                //CreateBy sẽ lấy id user qua thông tin đăng nhập luôn
                //po.CreatedBy = cmd.CurrentUserId,
                CreatedBy = cmd.CurrentUserId,
                CreatedAt = DateTime.UtcNow,
            };


            // xét đến thời gian hiện tại xem sản phẩm còn hiệu lực không
            var now = DateOnly.FromDateTime(DateTime.UtcNow);

            // Lấy danh sách ID sản phẩm từ request
            var productIds = req.PoItems.Select(p => p.ProductId).Distinct().ToList();


            var priceGroup = await _db.Pricebooks
                            // Chỉ lấy giá cho các sản phẩm có trong đơn hàng
                            .Where(pb => productIds.Contains(pb.ProductId)
                            // active mới cho lấy giá
                            && pb.Status == "Active"
                            //kiểm coi còn trong thời gian hợp lệ không
                            && pb.EffectiveFrom <= now
                            && (pb.EffectiveTo == null || pb.EffectiveTo >= now))
                            .GroupBy(p => p.ProductId)
                            .ToListAsync(ct); //lấy về List 
            ;


            var priceRows = priceGroup.ToDictionary
                                    (p => p.Key,
                                    p => p.First()
                                            .FloorPrice ?? 0 // ko có giá thì set = 0 tránh việc bị null
                                                             // giá trị có dạng {1 : 5000, 2 , 1000} {key, priceFloor}
                                    );

            //tạo từng line để add vô
            foreach (var item in req.PoItems)
            {
                var unitPrice = priceRows[item.ProductId];
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

