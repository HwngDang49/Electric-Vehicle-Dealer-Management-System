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
            var branches = await _db.Branches
                .OrderBy(b => b.BranchId) 
                .ProjectTo<GetListBranchDto>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result.Success(branches);
        }
    }
}
