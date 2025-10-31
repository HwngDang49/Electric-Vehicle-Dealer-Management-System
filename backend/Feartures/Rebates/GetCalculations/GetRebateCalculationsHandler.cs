using backend.Common.Auth;
using backend.Common.Paging;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Rebates.GetCalculations
{
    public sealed class GetRebateCalculationsHandler : IRequestHandler<GetRebateCalculationsQuery, PagedResult<GetRebateCalculationDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetRebateCalculationsHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedResult<GetRebateCalculationDto>> Handle(GetRebateCalculationsQuery query, CancellationToken ct)
        {
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();
            
            // Nếu không phải Admin, lấy DealerId từ token
            long? dealerId = null;
            if (userRole != Role.Admin.ToString())
            {
                dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            }

            // Chuẩn hóa pagination
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 20 : Math.Min(query.PageSize, 200);
            var skip = (page - 1) * pageSize;

            // Base query từ view
            var baseQuery = _db.VRebateCalcs.AsNoTracking();

            // Filter by DealerId (nếu không phải Admin)
            if (dealerId.HasValue)
            {
                baseQuery = baseQuery.Where(v => v.DealerId == dealerId.Value);
            }

            // Filter by AgreementId (optional)
            if (query.AgreementId.HasValue)
            {
                baseQuery = baseQuery.Where(v => v.AgreementId == query.AgreementId.Value);
            }

            // Filter by Period (optional)
            if (!string.IsNullOrWhiteSpace(query.Period))
            {
                baseQuery = baseQuery.Where(v => v.Period == query.Period);
            }

            // Count total
            var total = await baseQuery.CountAsync(ct);

            // Get paged items
            var items = await baseQuery
                .OrderByDescending(v => v.Period)
                .ThenByDescending(v => v.AgreementId)
                .Skip(skip)
                .Take(pageSize)
                .Select(v => new GetRebateCalculationDto
                {
                    AgreementId = v.AgreementId,
                    DealerId = v.DealerId,
                    Period = v.Period,
                    UnitsDelivered = v.UnitsDelivered,
                    EffectiveTierQty = v.EffectiveTierQty,
                    RebatePerUnit = v.RebatePerUnit,
                    CapAmount = v.CapAmount,
                    GrossRebateAmount = v.GrossRebateAmount,
                    PayableRebateAmount = v.PayableRebateAmount
                })
                .ToListAsync(ct);

            return PagedResult<GetRebateCalculationDto>.Create(items, page, pageSize, total);
        }
    }
}

