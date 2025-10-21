using Ardalis.Result;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.GetList
{
    public class GetListPoHandler : IRequestHandler<GetListPoQuery, Result<List<PoListItemDto>>>
    {
        private readonly EVDmsDbContext _db;

        public GetListPoHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<List<PoListItemDto>>> Handle(GetListPoQuery query, CancellationToken ct)
        {
            var pos = await _db.PurchaseOrders
                .AsNoTracking()
                .Include(p => p.PoItems)
                .Where(p => p.DealerId == query.DealerId)
                .OrderByDescending(p => p.CreateAt)
                .Select(p => new PoListItemDto
                {
                    PoId = p.PoId,
                    DealerId = p.DealerId,
                    BranchId = p.BranchId,
                    Status = p.Status,
                    ExpectedDate = p.ExpectedDate,
                    TotalAmount = p.TotalAmount,
                    CreateAt = p.CreateAt,
                    UpdateAt = p.UpdateAt,
                    CreateBy = p.CreateBy,
                    SubmittedBy = p.SubmittedBy,
                    ApprovedBy = p.ApprovedBy,
                    ConfirmedBy = p.ConfirmedBy,
                    ItemCount = p.PoItems.Count
                })
                .ToListAsync(ct);

            return Result.Success(pos);
        }
    }
}

