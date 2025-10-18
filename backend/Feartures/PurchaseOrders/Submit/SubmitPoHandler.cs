using System.Security.Cryptography;
using Ardalis.Result;
using AutoMapper;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.Submit
{
    public record SubmitPoRequestCommand(SubmitPoRequest Request, long CurrentId) : IRequest<Result<SubmitPoRequest>>;
    public class SubmitPoHandler : IRequestHandler<SubmitPoRequestCommand, Result<SubmitPoRequest>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public SubmitPoHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<SubmitPoRequest>> Handle(SubmitPoRequestCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            var po = await _db.PurchaseOrders.Include(p => p.PoItems).FirstOrDefaultAsync(p => p.PoId == req.PoId, ct);

            if (po == null)
            {
                return (Result.NotFound("PurchaseOrder does not exits"));
            }

            // kiểm check xem dealer có đúng với id của poId đó không
            if (po.DealerId != req.DealerId)
            {
                return Result.Forbidden($"Dealer {req.DealerId} not match with purchase order");
            }

            // tương tự như trên kiểm branch
            if (po.BranchId != req.BranchId)
            {
                return Result.Forbidden($"Branch {req.BranchId} not match with purchase order");
            }

            // submittedBy này được lấy giá trị từ userId trong jwt để gán vào luôn
            po.SubmittedBy = cmd.CurrentId;
            // chuyển trạng thái status 
            po.Status = POStatus.Submitted.ToString();

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}
