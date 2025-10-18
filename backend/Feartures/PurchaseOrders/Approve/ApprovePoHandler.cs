using Ardalis.Result;
using AutoMapper;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.Approve
{
    public record ApprovePoCommand(ApprovePoRequest Request, long CurrentId) : IRequest<Result<ApprovePoRequest>>;
    public class ApprovePoHandler : IRequestHandler<ApprovePoCommand, Result<ApprovePoRequest>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public ApprovePoHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<ApprovePoRequest>> Handle(ApprovePoCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            var po = await _db.PurchaseOrders.Include(p => p.PoItems).FirstOrDefaultAsync(p => p.PoId == req.PoId, ct);

            if (po is null) return Result.NotFound($"PO {req.PoId} not found.");

            // Chỉ cho approve khi đang Submitted
            if (po.Status != POStatus.Submitted.ToString())
                return Result.Error("Required ur status is submitted has been approved");

            // nếu đơn hàng có list = 0 thì trống không cho approved
            if (po.PoItems is null || po.PoItems.Count == 0)
                return Result.Error("PO must contain at least 1 line item");

            if (po.PoItems.Any(i => i.Qty <= 0) || po.PoItems.Any(i => i.UnitWholesale < 0))
                return Result.Error("Quantity must be > 0 and UnitPrice ≥ 0");

            // 4) CREDIT CHECK // 4.1 Lấy dealer + hạn mức
            var dealer = await _db.Dealers.FirstOrDefaultAsync(d => d.DealerId == po.DealerId, ct);

            if (dealer is null)
                return Result.Error($"Dealer {po.DealerId} not found.");

            // lấy giá trị công nợ để check xem có vượt quá không
            var creditLimit = dealer.CreditLimit;


            //chưa xong

            //-----------------------// 
            // submittedBy này được lấy giá trị từ userId trong jwt để gán vào luôn


            po.ApprovedBy = cmd.CurrentId;
            // chuyển trạng thái status 
            po.Status = POStatus.Approved.ToString();

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}
