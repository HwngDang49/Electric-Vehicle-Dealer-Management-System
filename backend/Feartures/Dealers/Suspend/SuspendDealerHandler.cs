using Ardalis.Result;
using backend.Common.Helpers;
using backend.Common.Services;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Suspend
{
    public class SuspendDealerHandler : IRequestHandler<SuspendDealerCommand, Result<SuspendDealerResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly DealerStatusChangeService _dealerStatusChangeService;

        public SuspendDealerHandler(EVDmsDbContext db, DealerStatusChangeService dealerStatusChangeService)
        {
            _db = db;
            _dealerStatusChangeService = dealerStatusChangeService;
        }

        public async Task<Result<SuspendDealerResponse>> Handle(SuspendDealerCommand request, CancellationToken ct)
        {
            // ✅ Must use tracking query (default) to update entity
            var dealer = await _db.Dealers.FirstOrDefaultAsync(d => d.DealerId == request.DealerId, ct);

            if (dealer is null)
            {
                return Result.NotFound($"Dealer {request.DealerId} not found.");
            }

            var current = Enum.Parse<DealerStatus>(dealer.Status);

            if (current == DealerStatus.Suspended)
            {
                return Result.Success(new SuspendDealerResponse
                {
                    DealerId = dealer.DealerId,
                    LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
                });
            }

            if (!DealerStatusRules.CanTransit(current, DealerStatus.Suspended))
            {
                return Result.Error($"Cannot transit {current} → {DealerStatus.Suspended}.");
            }

            dealer.Status = DealerStatus.Suspended.ToString();
            dealer.UpdatedAt = DateTime.UtcNow;

            // Handle cascade effects: suspend branches, users, deactivate promotions
            try
            {
                await _dealerStatusChangeService.HandleDealerSuspend(dealer.DealerId, ct);
            }
            catch (Exception ex)
            {
                throw; // Re-throw to fail the operation
            }

            // ✅ Don't call SaveChangesAsync here - TransactionBehavior will handle it
            // await _db.SaveChangesAsync(ct);

            var response = new SuspendDealerResponse
            {
                DealerId = dealer.DealerId,
                LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
            };

            return Result.Success(response);
        }
    }
}
