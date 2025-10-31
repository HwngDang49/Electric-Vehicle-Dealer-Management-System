using backend.Common.Auth;
using backend.Common.Paging;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Rebates.GetSettlements
{
    public sealed class GetRebateSettlementsHandler : IRequestHandler<GetRebateSettlementsQuery, PagedResult<GetRebateSettlementDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetRebateSettlementsHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedResult<GetRebateSettlementDto>> Handle(GetRebateSettlementsQuery query, CancellationToken ct)
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

            // Base query: chỉ lấy rebate claims (AgreementId IS NOT NULL và Period IS NOT NULL)
            var baseQuery = _db.Claims
                .AsNoTracking()
                .Include(c => c.Settlements)
                .Where(c => c.AgreementId != null && c.Period != null);

            // Filter by DealerId (nếu không phải Admin)
            if (dealerId.HasValue)
            {
                baseQuery = baseQuery.Where(c => c.DealerId == dealerId.Value);
            }

            // Filter by AgreementId (optional)
            if (query.AgreementId.HasValue)
            {
                baseQuery = baseQuery.Where(c => c.AgreementId == query.AgreementId.Value);
            }

            // Filter by Period (optional)
            if (!string.IsNullOrWhiteSpace(query.Period))
            {
                baseQuery = baseQuery.Where(c => c.Period == query.Period);
            }

            // Filter by Claim Status (optional)
            if (!string.IsNullOrWhiteSpace(query.ClaimStatus))
            {
                baseQuery = baseQuery.Where(c => c.Status == query.ClaimStatus);
            }

            // Count total
            var total = await baseQuery.CountAsync(ct);

            // Get paged items
            var claims = await baseQuery
                .OrderByDescending(c => c.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync(ct);

            // Map to DTO
            var items = claims.Select(c => new GetRebateSettlementDto
            {
                ClaimId = c.ClaimId,
                DealerId = c.DealerId,
                AgreementId = c.AgreementId,
                Period = c.Period,
                ClaimAmount = c.Amount,
                ClaimStatus = c.Status,
                ClaimCreatedAt = c.CreatedAt,
                ClaimResolvedAt = c.ResolvedAt,
                Settlements = c.Settlements
                    .OrderByDescending(s => s.PaidAt)
                    .Select(s => new SettlementDetailDto
                    {
                        SettlementId = s.SettlementId,
                        PaidAmount = s.PaidAmount,
                        PaidAt = s.PaidAt,
                        ReferenceNo = s.ReferenceNo
                    })
                    .ToList(),
                TotalSettledAmount = c.Settlements.Sum(s => s.PaidAmount)
            }).ToList();

            return PagedResult<GetRebateSettlementDto>.Create(items, page, pageSize, total);
        }
    }
}

