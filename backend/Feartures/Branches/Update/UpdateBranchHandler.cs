using Ardalis.Result;
using AutoMapper;
using backend.Common.Helpers;
using backend.Common.Services;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Branches.Update;

public class UpdateBranchHandler : IRequestHandler<UpdateBranchCommand, Result<UpdateBranchResponse>>
{
    private readonly EVDmsDbContext _db;
    private readonly IMapper _mapper;
    private readonly BranchStatusChangeService _branchStatusChangeService;

    public UpdateBranchHandler(EVDmsDbContext db, IMapper mapper, BranchStatusChangeService branchStatusChangeService)
    {
        _db = db;
        _mapper = mapper;
        _branchStatusChangeService = branchStatusChangeService;
    }

    public async Task<Result<UpdateBranchResponse>> Handle(UpdateBranchCommand command, CancellationToken ct)
    {
        var branch = await _db.Branches.FirstOrDefaultAsync(b => b.BranchId == command.BranchId, ct);

        if (branch == null)
        {
            return Result.NotFound($"Branch with id {command.BranchId} not found.");
        }

        // Validate status transition if status is being changed
        if (!string.IsNullOrWhiteSpace(command.Body.Status))
        {
            var currentStatus = Enum.Parse<BranchStatus>(branch.Status);
            var newStatus = Enum.Parse<BranchStatus>(command.Body.Status);

            if (currentStatus != newStatus)
            {
                // Check if transition is allowed
                if (!BranchStatusRules.CanTransit(currentStatus, newStatus))
                {
                    return Result.Error($"Cannot change branch status from '{currentStatus}' to '{newStatus}'. " +
                        $"Allowed transitions from '{currentStatus}': {string.Join(", ", GetAllowedTransitions(currentStatus))}");
                }

                // Handle cascade effects
                if (newStatus == BranchStatus.Suspended)
                {
                    await _branchStatusChangeService.HandleBranchSuspend(branch.BranchId, ct);
                }
                else if (newStatus == BranchStatus.Closed)
                {
                    await _branchStatusChangeService.HandleBranchClose(branch.BranchId, ct);
                }
                else if (newStatus == BranchStatus.Active)
                {
                    await _branchStatusChangeService.HandleBranchActive(branch.BranchId, ct);
                }
            }
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

    private static string[] GetAllowedTransitions(BranchStatus status)
    {
        return status switch
        {
            BranchStatus.Active => new[] { "Inactive", "Suspended", "Closed" },
            BranchStatus.Inactive => new[] { "Active", "Suspended", "Closed" },
            BranchStatus.Suspended => new[] { "Active", "Inactive", "Closed" },
            BranchStatus.Closed => new[] { "(none - terminal state)" },
            _ => Array.Empty<string>()
        };
    }
}


