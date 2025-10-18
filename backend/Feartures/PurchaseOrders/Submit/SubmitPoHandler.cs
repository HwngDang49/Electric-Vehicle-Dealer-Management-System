using System.Security.Cryptography;
using Ardalis.Result;
using AutoMapper;
using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.Submit
{
    public record SubmitPoRequestCommand(SubmitPoRequest Request) : IRequest<Result<SubmitPoRequest>>;
    public class SubmitPoHandler : IRequestHandler<SubmitPoRequestCommand, Result<SubmitPoRequest>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _http;

        public SubmitPoHandler(EVDmsDbContext db, IMapper mapper, IHttpContextAccessor http)
        {
            _db = db;
            _mapper = mapper;
            _http = http;
        }

        public async Task<Result<SubmitPoRequest>> Handle(SubmitPoRequestCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            var po = await _db.PurchaseOrders.Include(p => p.PoItems).FirstOrDefaultAsync(p => p.PoId == req.PoId, ct);

            if (po == null)
            {
                return (Result.NotFound("PurchaseOrder does not exits"));
            }

            var user = _http.HttpContext?.User.GetUserId();
            var userSubmit = await _db.Users.FirstOrDefaultAsync(u => u.UserId == user, ct);

            // kiểm check xem dealer có đúng với id của poId đó không
            if (po.DealerId != userSubmit.DealerId)
            {
                return (Result.Forbidden($"Dealer {userSubmit.DealerId}  not match with purchase order"));
            }

            // tương tự như trên kiểm branch
            if (po.BranchId != userSubmit.BranchId)
            {
                return (Result.Forbidden($"Branch {userSubmit.BranchId} not match with purchase order"));
            }

            // submittedBy này được lấy giá trị từ userId trong jwt để gán vào luôn
            po.SubmittedBy = userSubmit.UserId;
            po.UpdatedAt = DateTime.UtcNow;
            // chuyển trạng thái status 
            po.Status = POStatus.Submitted.ToString();

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}
