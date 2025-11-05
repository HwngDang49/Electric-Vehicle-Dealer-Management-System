
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Helpers;
using backend.Common.Paging;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Branches.GetListBranch
{
    public class GetListBranchHandler : IRequestHandler<GetListBranchQuery, PagedResult<GetListBranchDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public GetListBranchHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<PagedResult<GetListBranchDto>> Handle(GetListBranchQuery query, CancellationToken ct)
        {
            var page = query.PageNumber <= 0 ? 1 : query.PageNumber;
            var pageSize = query.PageSize <= 0 ? 10 : Math.Min(query.PageSize, 20);
            var skip = (page - 1) * pageSize;

            var branch = _db.Branches.AsNoTracking();

            //lọc theo dealerID
            if (query.DealerId.HasValue)
                branch = branch.Where(d => d.DealerId == query.DealerId.Value);

            if (!string.IsNullOrWhiteSpace(query.Status))
                branch = branch.Where(d => d.Status != null && d.Status == query.Status);

            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                var term = query.SearchTerm.Trim();
                var like = $"%{term}%";
                branch = branch.Where(d =>
                    (d.Code != null && EF.Functions.Like(d.Code, like)) ||
                    (d.Name != null && EF.Functions.Like(d.Name, like)) ||
                    (d.Address != null && EF.Functions.Like(d.Address, like)));
            }

            var totalItems = await branch.CountAsync(ct);

            var items = await branch
                .OrderByDescending(b => b.CreatedAt)
                .ThenByDescending(b => b.UpdatedAt)
                .Skip(skip)
                .Take(pageSize)
                .ProjectTo<GetListBranchDto>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            foreach (var item in items)
            {
                item.CreatedAt = DateTimeHelper.ToVietnamTime(item.CreatedAt);
                item.UpdatedAt = DateTimeHelper.ToVietnamTime(item.UpdatedAt);
            }

            return PagedResult<GetListBranchDto>.Create(items, totalItems, page, pageSize);
        }
    }
}
