using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Branches.GetListBranch
{
    public class GetListBranchHandler : IRequestHandler<GetListBranchQuery, Result<List<GetListBranchDto>>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public GetListBranchHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<List<GetListBranchDto>>> Handle(GetListBranchQuery request, CancellationToken ct)
        {
            var query = _db.Branches.AsQueryable();

            // Filter by DealerId if provided
            if (request.DealerId.HasValue)
            {
                query = query.Where(b => b.DealerId == request.DealerId.Value);
            }

            var branches = await query
                .OrderByDescending(b => b.CreatedAt)
                .ThenByDescending(b => b.UpdatedAt)
                .ProjectTo<GetListBranchDto>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result.Success(branches);
        }
    }
}
