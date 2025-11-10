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

                // Validate before closing: quotes that are finalized/sent must complete retail flow, all orders must be completed
                if (newStatus == BranchStatus.Closed)
                {
                    var now = DateTime.UtcNow;

                    // 1. Check Finalized quotes that haven't been converted to Order and haven't expired
                    // If quote is finalized/sent, it must be converted to order and completed
                    // Get all finalized quote IDs that have been converted to orders
                    var convertedQuoteIds = await _db.Orders
                        .Where(o => o.DealerId == branch.DealerId && o.QuoteId.HasValue)
                        .Select(o => o.QuoteId!.Value)
                        .Distinct()
                        .ToListAsync(ct);

                    var unprocessedQuotes = await _db.Quotes
                        .Where(q => q.DealerId == branch.DealerId && 
                                   (q.Status == QuoteStatus.Finalized.ToString() || q.Status == QuoteStatus.Confirmed.ToString()) &&
                                   !convertedQuoteIds.Contains(q.QuoteId) && // Not converted to Order
                                   (q.LockedUntil.HasValue && q.LockedUntil.Value >= now)) // Not expired
                        .CountAsync(ct);

                    if (unprocessedQuotes > 0)
                    {
                        return Result.Error($"Cannot close branch. There are {unprocessedQuotes} finalized/confirmed quote(s) that have not been converted to order and are still valid. " +
                            $"Quotes that are finalized or sent must complete the retail flow (convert to order and complete order) before closing the branch.");
                    }

                    // 2. Check orders: All orders must be completed (Closed, Delivered, or Canceled)
                    var incompleteOrders = await _db.Orders
                        .Where(o => o.DealerId == branch.DealerId && 
                                   o.Status != OrderStatus.Closed.ToString() && 
                                   o.Status != OrderStatus.Delivered.ToString() &&
                                   o.Status != OrderStatus.Canceled.ToString())
                        .CountAsync(ct);

                    if (incompleteOrders > 0)
                    {
                        return Result.Error($"Cannot close branch. There are {incompleteOrders} order(s) that have not completed the retail flow. " +
                            $"All orders must be in 'Closed', 'Delivered', or 'Canceled' status before closing a branch.");
                    }

                    await _branchStatusChangeService.HandleBranchClose(branch.BranchId, ct);
                }
                else if (newStatus == BranchStatus.Suspended)
                {
                    await _branchStatusChangeService.HandleBranchSuspend(branch.BranchId, ct);
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

        branch.UpdatedAt = DateTimeHelper.UtcNow();
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


