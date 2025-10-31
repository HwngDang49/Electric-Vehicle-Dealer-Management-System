using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.DealerAgreements.GetRebates
{
    public sealed class GetListAgreementRebatesHandler : IRequestHandler<GetListAgreementRebatesQuery, List<GetAgreementRebateDto>>
    {
        private readonly EVDmsDbContext _db;

        public GetListAgreementRebatesHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<List<GetAgreementRebateDto>> Handle(GetListAgreementRebatesQuery query, CancellationToken ct)
        {
            var baseQuery = _db.AgreementRebates
                .AsNoTracking()
                .Where(r => r.AgreementId == query.AgreementId);

            // Filter by Period (optional)
            if (!string.IsNullOrWhiteSpace(query.Period))
            {
                baseQuery = baseQuery.Where(r => r.Period == query.Period);
            }

            var rebates = await baseQuery
                .OrderByDescending(r => r.TierQty) // Tier cao nhất trước (cho logic tính rebate)
                .Select(r => new GetAgreementRebateDto
                {
                    RebateId = r.RebateId,
                    AgreementId = r.AgreementId,
                    Period = r.Period,
                    TierQty = r.TierQty,
                    RebatePerUnit = r.RebatePerUnit,
                    CapAmount = r.CapAmount,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync(ct);

            return rebates;
        }
    }
}

