using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Branches.GetBranch
{
    public class GetBranchByIdHandler : IRequestHandler<GetBranchByIdQuery, Result<GetBranchDetailDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        public GetBranchByIdHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }
        public async Task<Result<GetBranchDetailDto>> Handle(GetBranchByIdQuery request, CancellationToken ct)
        {
            var branch = await _db.Branches
                .Where(b => b.BranchId == request.BranchId)
                .ProjectTo<GetBranchDetailDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();
            if (branch == null)
            {
                return Result.NotFound($"Branch with id {request.BranchId} not found.");
            }
            return Result.Success(branch);
        }
    }
}
