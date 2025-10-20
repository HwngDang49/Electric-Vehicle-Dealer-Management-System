using Ardalis.Result;
using AutoMapper;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Branches.Update;

public class UpdateBranchHandler : IRequestHandler<UpdateBranchCommand, Result>
{
    private readonly EVDmsDbContext _db;
    private readonly IMapper _mapper;

    public UpdateBranchHandler(EVDmsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<Result> Handle(UpdateBranchCommand request, CancellationToken ct)
    {
        var req = request.Request;

        var branch = await _db.Branches.FirstOrDefaultAsync(b => b.BranchId == req.BranchId, ct);
        if (branch == null)
        {
            return Result.NotFound($"Branch with id {req.BranchId} not found.");
        }

        // Unique code check (excluding current branch)
        var codeExists = await _db.Branches.AnyAsync(b => b.Code == req.Code && b.BranchId != req.BranchId, ct);
        if (codeExists)
        {
            return Result.Error("Branch code already exists.");
        }

        branch.Code = req.Code;
        branch.Name = req.Name;
        branch.Address = req.Address;
        branch.Status = req.Status; // stored as string in entity
        branch.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return Result.Success();
    }
}


