using backend.Common.Auth;
using backend.Common.Paging;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Claims.GetClaims
{
    public sealed class GetClaimsHandler : IRequestHandler<GetClaimsQuery, PagedResult<GetClaimDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetClaimsHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedResult<GetClaimDto>> Handle(GetClaimsQuery query, CancellationToken ct)
        {
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();

            // Permission: Chỉ Admin và EVM Staff mới được xem tất cả claims
            // DealerManager/DealerStaff phải dùng GetMyClaims
            if (userRole != Role.Admin.ToString() && userRole != Role.EVMStaff.ToString())
            {
                throw new UnauthorizedAccessException("Chỉ Admin hoặc EVM Staff mới được xem tất cả claims. DealerManager vui lòng sử dụng endpoint /api/my-claims");
            }

            // Chuẩn hóa pagination
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 20 : Math.Min(query.PageSize, 200);
            var skip = (page - 1) * pageSize;

            // Base query từ Claims
            var baseQuery = _db.Claims
                .AsNoTracking()
                .Include(c => c.Dealer)
                .Include(c => c.Agreement)
                .AsQueryable();

            // Filter by DealerId (nếu được chỉ định)
            if (query.DealerId.HasValue)
            {
                baseQuery = baseQuery.Where(c => c.DealerId == query.DealerId.Value);
            }

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

            // Filter: Chỉ lấy rebate claims (có AgreementId và Period)
            baseQuery = baseQuery.Where(c => c.AgreementId != null && c.Period != null);

            // Count total
            var total = await baseQuery.CountAsync(ct);

            // Get paged items
            var items = await baseQuery
                .OrderByDescending(c => c.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .Select(c => new GetClaimDto
                {
                    ClaimId = c.ClaimId,
                    DealerId = c.DealerId,
                    DealerName = c.Dealer != null ? c.Dealer.Name : null,
                    AgreementId = c.AgreementId,
                    AgreementCode = c.Agreement != null ? c.Agreement.Code : null,
                    Period = c.Period,
                    Amount = c.Amount,
                    Status = c.Status,
                    CreatedAt = c.CreatedAt,
                    ResolvedAt = c.ResolvedAt
                })
                .ToListAsync(ct);

            return PagedResult<GetClaimDto>.Create(items, page, pageSize, total);
        }
    }
}

