using Ardalis.Result;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace backend.Feartures.Dealers.Activate
{
    public class ActivateDealerHandler : IRequestHandler<ActivateDealerCommand, Result>
    {
        private readonly EVDmsDbContext _db;

        public ActivateDealerHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result> Handle(ActivateDealerCommand request, CancellationToken ct)
        {
            var dealer = await _db.Dealers
            .FirstOrDefaultAsync(d => d.DealerId == request.DealerId, ct);

            if (dealer is null)
                return Result.NotFound($"Dealer {request.DealerId} not found.");

            // chỉ cho phép kích hoạt từ trạng thái Onboarding
            if (!string.Equals(dealer.Status, "Onboarding", StringComparison.OrdinalIgnoreCase))
                return Result.Error($"Dealer status must be 'Onboarding' to activate. Current: '{dealer.Status}'.");

            //var current = dealer.StatusEnum;
            //if (!DealerStatusRules.CanTransit(current, DealerStatus.Live))
            //    return Result.Error($"Cannot transit {current} → {DealerStatus.Live}.");

            //dealer.StatusEnum = DealerStatus.Live;
            //dealer.UpdatedAt = DateTime.UtcNow;

            dealer.Status = "Live";
            dealer.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
    }
}
