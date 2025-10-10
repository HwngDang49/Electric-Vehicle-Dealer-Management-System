using Ardalis.Result;
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

        public CreateBranchHandler(EVDmsDbContext db)
        {
            _db = db;
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
            var branch = new Branch
            {
                Code = req.Code,
                Name = req.Name,
                Address = req.Address,
                Status = "Active",
                DealerId = req.DealerId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var checkExistDealer = await _db.Dealers
                .AnyAsync(d => d.DealerId == branch.DealerId, ct);

            if (!checkExistDealer)
            {
                return Result.Error("DealerId does not exists.");
            }

            _db.Branches.Add(branch);
            await _db.SaveChangesAsync(ct);
            return Result.Success(branch.BranchId);
        }
    }
}
