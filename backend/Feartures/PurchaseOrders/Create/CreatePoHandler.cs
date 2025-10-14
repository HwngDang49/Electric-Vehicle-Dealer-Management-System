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



            var now = DateOnly.FromDateTime(DateTime.UtcNow);

            var pricebook = await _db.Pricebooks
                            .Where(pb => pb.Status == "Active"
                            && pb.EffectiveFrom <= now
                            && pb.EffectiveTo == null || pb.EffectiveTo >= now
                            ).FirstOrDefaultAsync(ct);
            ;

            // lấy list product có trong item 
            var productIds = req.PoItems.Select(p => p.ProductId).Distinct().ToList();

            var priceRows = await _db.Pricebooks
                                .Where(x => x.PricebookId == pricebook.PricebookId
                                && productIds.Contains(x.PricebookId)) // chỉ lấy giá cho các ProductId trong req
                                .ToListAsync();

            var priceMap = priceRows.GroupBy(x => x.ProductId)
                                    .ToDictionary( // kiểu [id 1 : price: 5k]
                                     g => g.Key, // key ở đây dại diên cho productId
                                     g =>
                                     {
                                         var row = g
                                            .First();
                                         return new { Unitprice = row.FloorPrice };
                                     }
                                    );



            //tạo từng line để add vô
            foreach (var item in req.PoItems)
            {
                var price = priceMap[item.ProductId];
                var unitPrice = price.Unitprice ?? 0;
                po.PoItems.Add(new PoItem
                {
                    ProductId = item.ProductId,
                    Qty = item.Qty,
                    // phần unit này chờ có product mới liên kết giá qua được
                    UnitWholesale = unitPrice,
                    LineTotal = unitPrice * item.Qty
                });
            }

            //foreach (var item in query)
            //{

            //}

            // kiểm tra xem trong đơn có hàng không
            if (req.PoItems.Count <= 0) return Result.Error("does not product apper in po");

            _db.PurchaseOrders.Add(po);

            await _db.SaveChangesAsync(ct);

            return Result.Success(po.PoId);
        }
    }
}
