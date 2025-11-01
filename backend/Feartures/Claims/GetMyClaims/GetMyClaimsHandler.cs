using backend.Common.Auth;
using backend.Common.Paging;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Claims.GetMyClaims
{
    public sealed class GetMyClaimsHandler : IRequestHandler<GetMyClaimsQuery, PagedResult<GetMyClaimDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetMyClaimsHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedResult<GetMyClaimDto>> Handle(GetMyClaimsQuery query, CancellationToken ct)
        {
            // Lấy DealerId từ token (DealerManager/DealerStaff)
            // GetDealerId() trả về long (không nullable), throw exception nếu không có
            long dealerId;
            try
            {
                dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            }
            catch (UnauthorizedAccessException)
            {
                // Nếu không có dealerId → return empty
                return PagedResult<GetMyClaimDto>.Create(new List<GetMyClaimDto>(), query.Page, query.PageSize, 0);
            }

            // Chuẩn hóa pagination
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 20 : Math.Min(query.PageSize, 200);
            var skip = (page - 1) * pageSize;

            // Base query: chỉ lấy claims của dealer này
            var baseQuery = _db.Claims
                .AsNoTracking()
                .Include(c => c.Agreement)
                .Include(c => c.Settlements)
                .Where(c => c.DealerId == dealerId
                            && c.AgreementId != null  // Chỉ lấy rebate claims
                            && c.Period != null);

            // Filter by AgreementId
            if (query.AgreementId.HasValue)
            {
                baseQuery = baseQuery.Where(c => c.AgreementId == query.AgreementId.Value);
            }

            // Filter by Period
            if (!string.IsNullOrWhiteSpace(query.Period))
            {
                baseQuery = baseQuery.Where(c => c.Period == query.Period);
            }

            // Filter by Status
            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                baseQuery = baseQuery.Where(c => c.Status == query.Status);
            }

            // Count total
            var total = await baseQuery.CountAsync(ct);

            // Get paged items
            var items = await baseQuery
                .OrderByDescending(c => c.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .Select(c => new GetMyClaimDto
                {
                    ClaimId = c.ClaimId,
                    AgreementId = c.AgreementId,
                    AgreementCode = c.Agreement != null ? c.Agreement.Code : null,
                    Period = c.Period,
                    Amount = c.Amount,
                    Status = c.Status,
                    CreatedAt = c.CreatedAt,
                    ResolvedAt = c.ResolvedAt,
                    SettledAmount = c.Settlements
                        .Where(s => s.ClaimId == c.ClaimId)
                        .Select(s => s.PaidAmount)
                        .FirstOrDefault()
                })
                .ToListAsync(ct);

            return PagedResult<GetMyClaimDto>.Create(items, page, pageSize, total);
        }
    }
}

