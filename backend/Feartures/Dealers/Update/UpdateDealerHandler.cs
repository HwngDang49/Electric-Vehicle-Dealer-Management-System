using Ardalis.Result;
using AutoMapper;
using backend.Common.Helpers;
using backend.Common.Services;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Update
{
    public class UpdateDealerHandler : IRequestHandler<UpdateDealerCommand, Result<UpdateDealerResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        private readonly DealerStatusChangeService _dealerStatusChangeService;

        public UpdateDealerHandler(EVDmsDbContext db, IMapper mapper, DealerStatusChangeService dealerStatusChangeService)
        {
            _db = db;
            _mapper = mapper;
            _dealerStatusChangeService = dealerStatusChangeService;
        }

        public async Task<Result<UpdateDealerResponse>> Handle(UpdateDealerCommand command, CancellationToken ct)
        {
            var dealer = await _db.Dealers.FirstOrDefaultAsync(d => d.DealerId == command.DealerId, ct);

            if (dealer is null)
            {
                return Result.NotFound($"Dealer {command.DealerId} not found.");
            }

            var currentStatus = Enum.Parse<DealerStatus>(dealer.Status);

            // Validate code uniqueness
            if (!string.IsNullOrWhiteSpace(command.Body.Code) && !string.Equals(command.Body.Code, dealer.Code, StringComparison.Ordinal))
            {
                var codeExists = await _db.Dealers.AnyAsync(d => d.Code == command.Body.Code, ct);
                if (codeExists)
                {
                    return Result.Error("Dealer code already exists.");
                }
                dealer.Code = command.Body.Code!;
            }

            // Map other properties (excluding Status - we'll handle it separately)
            _mapper.Map(command.Body, dealer);

            if (!string.IsNullOrWhiteSpace(command.Body.Status))
            {
                // Parse new status
                if (!Enum.TryParse<DealerStatus>(command.Body.Status, out var newStatus))
                {
                    return Result.Error($"Invalid status value: {command.Body.Status}");
                }

                // If status is changing, validate transition
                if (currentStatus != newStatus)
                {
                    // Validate transition is allowed
                    if (!DealerStatusRules.CanTransit(currentStatus, newStatus))
                    {
                        return Result.Error($"Cannot change dealer status from '{currentStatus}' to '{newStatus}'. " +
                            $"Allowed transitions from '{currentStatus}': {string.Join(", ", GetAllowedTransitions(currentStatus))}");
                    }

                    // Handle cascade effects based on new status
                    try
                    {
                        if (newStatus == DealerStatus.Suspended)
                        {
                            await _dealerStatusChangeService.HandleDealerSuspend(dealer.DealerId, ct);
                        }
                        else if (newStatus == DealerStatus.Closed)
                        {
                            // ✅ Validate: All branches must be closed before closing dealer
                            var nonClosedBranches = await _db.Branches
                                .Where(b => b.DealerId == dealer.DealerId && b.Status != BranchStatus.Closed.ToString())
                                .Select(b => new { b.BranchId, b.Code, b.Status })
                                .ToListAsync(ct);

                            if (nonClosedBranches.Any())
                            {
                                var branchDetails = string.Join(", ", nonClosedBranches.Select(b => $"{b.Code} ({b.Status})"));
                                return Result.Error($"Cannot close dealer. All branches must be closed first. " +
                                    $"Found {nonClosedBranches.Count} branch(es) that are not closed: {branchDetails}. " +
                                    $"Please close all branches before closing the dealer.");
                            }

                            await _dealerStatusChangeService.HandleDealerClose(dealer.DealerId, ct);
                        }
                        // Note: For Live/Onboarding transitions, no cascade effects needed
                    }
                    catch (Exception ex)
                    {
                        throw; // Re-throw to fail the operation
                    }

                    dealer.Status = newStatus.ToString();
                }
            }

            dealer.UpdatedAt = DateTime.UtcNow;

            // ✅ Don't call SaveChangesAsync here - TransactionBehavior will handle it
            // await _db.SaveChangesAsync(ct);

            var response = new UpdateDealerResponse
            {
                DealerId = dealer.DealerId,
                LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
            };

            return Result.Success(response);
        }

        private static string[] GetAllowedTransitions(DealerStatus status)
        {
            return status switch
            {
                DealerStatus.Onboarding => new[] { "Live", "Closed" },
                DealerStatus.Live => new[] { "Suspended", "Closed" },
                DealerStatus.Suspended => new[] { "Live", "Closed" },
                DealerStatus.Closed => new[] { "(none - terminal state)" },
                _ => Array.Empty<string>()
            };
        }
    }
}
