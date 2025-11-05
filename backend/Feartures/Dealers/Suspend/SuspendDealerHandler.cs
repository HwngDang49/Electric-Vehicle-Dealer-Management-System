using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Suspend
{
    public class SuspendDealerHandler : IRequestHandler<SuspendDealerCommand, Result<SuspendDealerResponse>>
    {
        private readonly EVDmsDbContext _db;

        public SuspendDealerHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<SuspendDealerResponse>> Handle(SuspendDealerCommand request, CancellationToken ct)
        {
            var dealer = await _db.Dealers.FirstOrDefaultAsync(d => d.DealerId == request.DealerId, ct);

            if (dealer is null) return Result.NotFound($"Dealer {request.DealerId} not found.");

            var current = Enum.Parse<DealerStatus>(dealer.Status);
            if (current == DealerStatus.Suspended)
                return Result.Success(new SuspendDealerResponse
                {
                    DealerId = dealer.DealerId,
                    LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
                });

            if (!DealerStatusRules.CanTransit(current, DealerStatus.Suspended))
                return Result.Error($"Cannot transit {current} → {DealerStatus.Suspended}.");

            dealer.Status = DealerStatus.Suspended.ToString();
            dealer.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            var response = new SuspendDealerResponse
            {
                DealerId = dealer.DealerId,
                LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
            };

            return Result.Success(response);
        }
    }
}
