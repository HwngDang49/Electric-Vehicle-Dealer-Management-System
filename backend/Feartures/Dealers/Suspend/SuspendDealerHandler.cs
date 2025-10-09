using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Suspend
{
    public class SuspendDealerHandler : IRequestHandler<SuspendDealerCommand, Result>
    {
        private readonly EVDmsDbContext _db;

        public SuspendDealerHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result> Handle(SuspendDealerCommand request, CancellationToken ct)
        {
            var dealer = await _db.Dealers.FirstOrDefaultAsync(d => d.DealerId == request.DealerId, ct);
            if (dealer is null) return Result.NotFound($"Dealer {request.DealerId} not found.");

            var current = dealer.StatusEnum; // dùng partial property
            if (!DealerStatusRules.CanTransit(current, DealerStatus.Suspended))
                return Result.Error($"Cannot transit {current} → {DealerStatus.Suspended}.");

            dealer.StatusEnum = DealerStatus.Suspended;
            dealer.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
    }
}
