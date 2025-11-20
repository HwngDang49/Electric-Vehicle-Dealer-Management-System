using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Common.Paging;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.AllocateVin
{
    public class GetAvailableVinsHandler : IRequestHandler<GetAvailableVinsQuery, PagedResult<AvailableVinDto>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetAvailableVinsHandler(
            EVDmsDbContext dbContext,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedResult<AvailableVinDto>> Handle(GetAvailableVinsQuery query, CancellationToken ct)
        {
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            var branchId = _httpContextAccessor.HttpContext!.User.GetBranchId();

            var vinsQuery = _dbContext.Inventories
                .AsNoTracking()
                .Include(i => i.Product)
                .Include(i => i.Branch)
                .Where(i => i.DealerId == dealerId && i.BranchId == branchId);

            // Filter theo product
            if (query.ProductId.HasValue)
            {
                vinsQuery = vinsQuery.Where(i => i.ProductId == query.ProductId.Value);
            }

            // Filter theo branch
            if (query.BranchId.HasValue)
            {
                vinsQuery = vinsQuery.Where(i => i.BranchId == query.BranchId.Value);
            }

            // Filter by Status
            if (!string.IsNullOrEmpty(query.Status))
            {
                vinsQuery = vinsQuery.Where(i => i.Status == query.Status);
            }

            var total = await vinsQuery.CountAsync(ct);
            var skip = query.Page <= 1 ? 0 : (query.Page - 1) * query.PageSize;

            var items = await vinsQuery
                .OrderBy(i => i.CreatedAt)
                .Skip(skip)
                .Take(query.PageSize)
                .Select(i => new AvailableVinDto
                {
                    Vin = i.Vin,
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    ColorName = i.Product.ColorName,
                    BranchId = i.BranchId,
                    BranchName = i.Branch != null ? i.Branch.Name : null,
                    Status = i.Status,
                    ReceivedAt = i.ReceivedAt,
                    CreatedAt = i.CreatedAt
                })
                .ToListAsync(ct);

            // Convert DateTime từ UTC sang giờ VN cho tất cả items
            foreach (var item in items)
            {
                item.CreatedAt = DateTimeHelper.ToVietnamTime(item.CreatedAt);
                if (item.ReceivedAt.HasValue)
                {
                    item.ReceivedAt = DateTimeHelper.ToVietnamTime(item.ReceivedAt.Value);
                }
            }

            return PagedResult<AvailableVinDto>.Create(items, query.Page, query.PageSize, total);
        }
    }
}
