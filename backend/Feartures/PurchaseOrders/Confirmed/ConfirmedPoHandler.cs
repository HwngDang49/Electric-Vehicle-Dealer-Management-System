using Ardalis.Result;
using AutoMapper;
using backend.Domain.Enums;
using backend.Feartures.PurchaseOrders.Approve;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.Confirmed
{

    public record ConfirmedPoCommand(ConfirmedPoRequest Request, long CurrentId) : IRequest<Result<ConfirmedPoRequest>>;
    public class ConfirmedPoHandler : IRequestHandler<ConfirmedPoCommand, Result<ConfirmedPoRequest>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public ConfirmedPoHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<ConfirmedPoRequest>> Handle(ConfirmedPoCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            var po = await _db.PurchaseOrders.Include(p => p.PoItems).FirstOrDefaultAsync(p => p.PoId == req.PoId, ct);

            if (po is null) return Result.NotFound($"PO {req.PoId} not found.");

            // Chỉ cho approve khi đang Approved
            if (po.Status != POStatus.Approved.ToString())
                return Result.Error("Required ur status is Approved has been approved");

            // ConfirmedBy này được lấy giá trị từ userId trong jwt để gán vào luôn

            po.ConfirmedBy = cmd.CurrentId;
            po.UpdatedAt = DateTime.UtcNow;
            // chuyển trạng thái status 
            po.Status = POStatus.Confirmed.ToString();

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}
