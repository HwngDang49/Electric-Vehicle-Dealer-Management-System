using backend.Common.Auth;
using backend.Common.Paging;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.DealerAgreements.GetList
{
    public sealed class GetListDealerAgreementsHandler : IRequestHandler<GetListDealerAgreementsQuery, PagedResult<GetListDealerAgreementsDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetListDealerAgreementsHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedResult<GetListDealerAgreementsDto>> Handle(GetListDealerAgreementsQuery query, CancellationToken ct)
        {
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();

            // Nếu không phải Admin, lấy DealerId từ token và bỏ qua DealerId từ query
            long? dealerId = null;
            if (userRole != Role.Admin.ToString())
            {
                dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            }
            else if (query.DealerId.HasValue)
            {
                // Admin có thể filter theo DealerId
                dealerId = query.DealerId.Value;
            }

            // Chuẩn hóa pagination
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 20 : Math.Min(query.PageSize, 200);
            var skip = (page - 1) * pageSize;

            // Base query
            var baseQuery = _db.DealerAgreements.AsNoTracking();

            // Filter by DealerId
            if (dealerId.HasValue)
            {
                baseQuery = baseQuery.Where(a => a.DealerId == dealerId.Value);
            }

            // Filter by Status (optional)
            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                baseQuery = baseQuery.Where(a => a.Status == query.Status);
            }

            // Count total
            var total = await baseQuery.CountAsync(ct);

            // Get paged items
            var items = await baseQuery
                .OrderByDescending(a => a.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .Select(a => new GetListDealerAgreementsDto
                {
                    AgreementId = a.AgreementId,
                    DealerId = a.DealerId,
                    Code = a.Code,
                    Title = a.Title,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    Status = a.Status,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync(ct);

            return PagedResult<GetListDealerAgreementsDto>.Create(items, page, pageSize, total);
        }
    }
}

