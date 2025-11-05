using Ardalis.Result;
using AutoMapper;
using backend.Common.Helpers;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Branches.Update;

public class UpdateBranchHandler : IRequestHandler<UpdateBranchCommand, Result<UpdateBranchResponse>>
{
    private readonly EVDmsDbContext _db;
    private readonly IMapper _mapper;

    public UpdateBranchHandler(EVDmsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<Result<UpdateBranchResponse>> Handle(UpdateBranchCommand command, CancellationToken ct)
    {
        var branch = await _db.Branches.FirstOrDefaultAsync(b => b.BranchId == command.BranchId, ct);

        if (branch == null)
        {
            return Result.NotFound($"Branch with id {command.BranchId} not found.");
        }

        if (!string.IsNullOrWhiteSpace(command.Body.Code) && !string.Equals(command.Body.Code, branch.Code, StringComparison.Ordinal))
        {
            var codeExists = await _db.Branches.AnyAsync(b => b.Code == command.Body.Code && b.BranchId != command.BranchId, ct);
            if (codeExists)
            {
                return Result.Error("Mã chi nhánh này đã tồn tại");
            }
            branch.Code = command.Body.Code;
        }

        _mapper.Map(command.Body, branch);

        if (!string.IsNullOrWhiteSpace(command.Body.Status))
        {
            branch.Status = command.Body.Status;
        }

        branch.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        var response = new UpdateBranchResponse
        {
            BranchId = branch.BranchId,
            LastUpdatedAt = DateTimeHelper.ToVietnamTime(branch.UpdatedAt)
        };

        return Result.Success(response);
    }
}


