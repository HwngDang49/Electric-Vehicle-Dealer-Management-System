using System.Buffers.Text;
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

            //var po = _mapper.Map<PurchaseOrder>(req);



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

            //tạo từng line để add vô
             foreach (var item in req.PoItems)
               {
                   po.PoItems.Add(new PoItem
                   {
                       ProductId = item.ProductId,
                       Qty = item.Qty,
                       // phần unit này chờ có product mới liên kết giá qua được
                       UnitWholesale = item.UnitPrice,
                       LineTotal = item.UnitPrice * item.Qty
                   });
               }



            // Chọn GLOBAL (dealer_id NULL), đang hiệu lực, status Active
            // Nếu có nhiều bản ghi trùng product & chồng hiệu lực, ưu tiên cái có effective_from mới nhất.
            //var productIds = req.PoItems.Select(i => i.ProductId).Distinct().ToList();
            //var now = DateOnly.FromDateTime(DateTime.UtcNow);

            //var query = _db.Pricebooks.AsNoTracking()
            //    .Where(p => p.DealerId == null                      // Global
            //        && productIds.Contains(p.ProductId)             // chỉ lấy sản phẩm càn 
            //        && p.Status == "Actived"
            //        && p.EffectiveFrom <= now
            //        && (p.EffectiveTo == null || p.EffectiveTo >= now)
            //        && p.FloorPrice != null);                       // phải có floor_price


            //var priced = await query
            //        .Where(p => p.EffectiveFrom ==
            //            query.Where(q => q.ProductId == p.ProductId)
            //                 .Max(q => (DateTime?)q.EffectiveFrom))       // max effective_from cho từng product
            //        .GroupBy(p => p.ProductId)
            //        .Select(g => g.OrderByDescending(x => x.CreatedAt).First())
            //        .Select(x => new { x.ProductId, UnitWholesale = x.FloorPrice!.Value })
            //        .ToListAsync(ct);


            //var prices = priced.ToDictionary(x => x.ProductId, x => x.UnitWholesale);


            //po.PoItems = new List<PoItem>(req.PoItems.Count);



            //decimal total = 0;

            //for (int i = 0; i < req.PoItems.Count; i++)
            //{
            //    var src = req.PoItems[i]; // mỗi sản phẩm user thêm vào list (ProductId, Qty)

            //    if (!prices.TryGetValue(src.ProductId, out var unit))
            //        return Result.Invalid(new ValidationError
            //        {
            //            Identifier = "Pricebook",
            //            ErrorMessage = $"Thiếu giá sàn cho ProductId={src.ProductId}"
            //        });

            //    var lineTotal = Math.Round(unit * src.Qty, 2); // decimal, không nullable

            //    var line = new PoItem
            //    {
            //        ProductId = src.ProductId,
            //        Qty = src.Qty,
            //        UnitWholesale = unit,     // gán giá sàn vào 
            //        LineTotal = lineTotal
            //    };

            //    po.PoItems.Add(line);

            //    //total += lineTotal;
            //}

            // kiểm tra xem trong đơn có hàng không
            if (req.PoItems.Count <= 0) return Result.Error("does not product apper in po");

            _db.PurchaseOrders.Add(po);

            await _db.SaveChangesAsync(ct);

            return Result.Success(po.PoId);
        }
    }
}
