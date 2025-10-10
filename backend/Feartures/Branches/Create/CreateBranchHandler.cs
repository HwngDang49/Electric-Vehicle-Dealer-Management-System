using Ardalis.Result;
using AutoMapper;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Branches.Create
{
    public record CreateBranchCommand(CreateBranchRequest Request) : IRequest<Result<long>>;
    public class CreateBranchHandler : IRequestHandler<CreateBranchCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public CreateBranchHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<long>> Handle(CreateBranchCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;
            var exists = await _db.Branches
                .AnyAsync(b => b.Code == req.Code, ct);

            if (exists)
            {
                return Result.Error("Branch code already exists.");
            }
            var branch = _mapper.Map<Branch>(req);

            branch.CreatedAt = DateTime.UtcNow;
            branch.UpdatedAt = DateTime.UtcNow;


            _db.Branches.Add(branch);
            await _db.SaveChangesAsync(ct);
            return Result.Success(branch.BranchId);
        }
    }
}
