using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Helpers;
using backend.Common.Paging;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.GetList
{
    public class GetDealersHandler : IRequestHandler<GetDealersQuery, PagedResult<GetDealersDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public GetDealersHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<PagedResult<GetDealersDto>> Handle(GetDealersQuery query, CancellationToken ct)
        {
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 20 : Math.Min(query.PageSize, 30);
            var skip = (page - 1) * pageSize; // Số bản ghi cần bỏ qua

            var dealer = _db.Dealers
                .AsNoTracking(); //IQueryable<Dealer>


            if (!string.IsNullOrWhiteSpace(query.Status))
                dealer = dealer.Where(d => d.Status != null && d.Status == query.Status);

            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                var term = query.SearchTerm.Trim();
                var like = $"%{term}%";
                dealer = dealer.Where(d =>
                    (d.Code != null && EF.Functions.Like(d.Code, like)) ||
                    (d.Name != null && EF.Functions.Like(d.Name, like)) ||
                    (d.LegalName != null && EF.Functions.Like(d.LegalName, like)));
            }

            var total = await dealer.CountAsync(ct);

            var items = await dealer
                //.OrderBy(d => d.Name)
                .OrderByDescending(d => d.CreatedAt)
                .Skip(skip).Take(pageSize)
                .ProjectTo<GetDealersDto>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            foreach (var item in items)
            {
                item.CreatedAt = DateTimeHelper.ToVietnamTime(item.CreatedAt);
                item.UpdatedAt = DateTimeHelper.ToVietnamTime(item.UpdatedAt);
            }

            return PagedResult<GetDealersDto>.Create(items, page, pageSize, total);
        }
    }
}
