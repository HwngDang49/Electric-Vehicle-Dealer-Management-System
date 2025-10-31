using backend.Common.Auth;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Rebates.GetReport
{
    public sealed class GetRebateReportHandler : IRequestHandler<GetRebateReportQuery, List<GetRebateReportDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetRebateReportHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<GetRebateReportDto>> Handle(GetRebateReportQuery query, CancellationToken ct)
        {
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();
            
            // Nếu không phải Admin, lấy DealerId từ token
            long? dealerId = null;
            if (userRole != Role.Admin.ToString())
            {
                dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            }

            // Query từ view v_rebate_period_sales (doanh số)
            var salesQuery = _db.VRebatePeriodSales.AsNoTracking();
            
            // Query từ view v_rebate_calc (tính toán rebate)
            var calcQuery = _db.VRebateCalcs.AsNoTracking();

            // Filter by DealerId (nếu không phải Admin)
            if (dealerId.HasValue)
            {
                salesQuery = salesQuery.Where(v => v.DealerId == dealerId.Value);
                calcQuery = calcQuery.Where(v => v.DealerId == dealerId.Value);
            }

            // Filter by AgreementId (optional)
            if (query.AgreementId.HasValue)
            {
                salesQuery = salesQuery.Where(v => v.AgreementId == query.AgreementId.Value);
                calcQuery = calcQuery.Where(v => v.AgreementId == query.AgreementId.Value);
            }

            // Filter by Period range (optional)
            if (!string.IsNullOrWhiteSpace(query.PeriodFrom))
            {
                salesQuery = salesQuery.Where(v => string.Compare(v.Period, query.PeriodFrom) >= 0);
                calcQuery = calcQuery.Where(v => string.Compare(v.Period, query.PeriodFrom) >= 0);
            }

            if (!string.IsNullOrWhiteSpace(query.PeriodTo))
            {
                salesQuery = salesQuery.Where(v => string.Compare(v.Period, query.PeriodTo) <= 0);
                calcQuery = calcQuery.Where(v => string.Compare(v.Period, query.PeriodTo) <= 0);
            }

            // Get data
            var sales = await salesQuery.ToListAsync(ct);
            var calcs = await calcQuery.ToListAsync(ct);

            // Get Claims và Settlements
            var claimQuery = _db.Claims
                .AsNoTracking()
                .Include(c => c.Settlements)
                .Where(c => c.AgreementId != null && c.Period != null);

            if (dealerId.HasValue)
                claimQuery = claimQuery.Where(c => c.DealerId == dealerId.Value);

            if (query.AgreementId.HasValue)
                claimQuery = claimQuery.Where(c => c.AgreementId == query.AgreementId.Value);

            if (!string.IsNullOrWhiteSpace(query.PeriodFrom))
                claimQuery = claimQuery.Where(c => string.Compare(c.Period!, query.PeriodFrom) >= 0);

            if (!string.IsNullOrWhiteSpace(query.PeriodTo))
                claimQuery = claimQuery.Where(c => string.Compare(c.Period!, query.PeriodTo) <= 0);

            var claims = await claimQuery.ToListAsync(ct);

            // Join data: Group by AgreementId + Period
            var allPeriods = sales
                .Select(s => new { s.AgreementId, s.Period, s.DealerId })
                .Union(calcs.Select(c => new { c.AgreementId, c.Period, c.DealerId }))
                .Union(claims.Select(c => new { AgreementId = c.AgreementId!.Value, Period = c.Period!, c.DealerId }))
                .Distinct()
                .ToList();

            var report = allPeriods.Select(p =>
            {
                var sale = sales.FirstOrDefault(s => s.AgreementId == p.AgreementId && s.Period == p.Period);
                var calc = calcs.FirstOrDefault(c => c.AgreementId == p.AgreementId && c.Period == p.Period);
                var claim = claims.FirstOrDefault(c => c.AgreementId == p.AgreementId && c.Period == p.Period);

                return new GetRebateReportDto
                {
                    AgreementId = p.AgreementId,
                    DealerId = p.DealerId,
                    Period = p.Period,
                    
                    // Từ v_rebate_period_sales
                    OrderCount = sale?.OrderCount,
                    UnitsDelivered = sale?.UnitsDelivered ?? calc?.UnitsDelivered,
                    RetailRevenue = sale?.RetailRevenue,
                    
                    // Từ v_rebate_calc
                    EffectiveTierQty = calc?.EffectiveTierQty,
                    RebatePerUnit = calc?.RebatePerUnit,
                    CapAmount = calc?.CapAmount,
                    GrossRebateAmount = calc?.GrossRebateAmount,
                    PayableRebateAmount = calc?.PayableRebateAmount,
                    
                    // Từ Claims
                    ClaimedAmount = claim?.Amount,
                    ClaimStatus = claim?.Status,
                    TotalSettledAmount = claim?.Settlements.Sum(s => s.PaidAmount) ?? 0
                };
            })
            .OrderByDescending(r => r.Period)
            .ThenByDescending(r => r.AgreementId)
            .ToList();

            return report;
        }
    }
}

