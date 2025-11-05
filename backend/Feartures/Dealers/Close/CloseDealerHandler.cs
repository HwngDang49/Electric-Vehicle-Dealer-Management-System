using Ardalis.Result;
using backend.Common.Helpers;
using backend.Common.Services;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Close
{
    public class CloseDealerHandler : IRequestHandler<CloseDealerCommand, Result<CloseDealerResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly DealerStatusChangeService _dealerStatusChangeService;

        public CloseDealerHandler(EVDmsDbContext db, DealerStatusChangeService dealerStatusChangeService)
        {
            _db = db;
            _dealerStatusChangeService = dealerStatusChangeService;
        }

        public async Task<Result<CloseDealerResponse>> Handle(CloseDealerCommand command, CancellationToken ct)
        {
            var dealer = await _db.Dealers
                .FirstOrDefaultAsync(d => d.DealerId == command.DealerId, ct);

            if (dealer is null)
            {
                return Result.NotFound($"Dealer {command.DealerId} not found.");
            }

            var current = Enum.Parse<DealerStatus>(dealer.Status);

            if (current == DealerStatus.Closed)
            {
                return Result.Success(new CloseDealerResponse
                {
                    DealerId = dealer.DealerId,
                    LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
                });
            }

            if (!DealerStatusRules.CanTransit(current, DealerStatus.Closed))
            {
                return Result.Error($"Cannot transit {current} → {DealerStatus.Closed}.");
            }

            dealer.Status = DealerStatus.Closed.ToString();
            dealer.UpdatedAt = DateTime.UtcNow;

            // Handle cascade effects: close branches, deactivate users, promotions, pricebooks, expire agreements
            await _dealerStatusChangeService.HandleDealerClose(dealer.DealerId, ct);

            // ✅ Don't call SaveChangesAsync here - TransactionBehavior will handle it
            // await _db.SaveChangesAsync(ct);

            var response = new CloseDealerResponse
            {
                DealerId = dealer.DealerId,
                LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
            };
            return Result.Success(response);
        }

    }
}
