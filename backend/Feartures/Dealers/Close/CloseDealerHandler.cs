using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Close
{
    public class CloseDealerHandler : IRequestHandler<CloseDealerCommand, Result<CloseDealerResponse>>
    {
        private readonly EVDmsDbContext _db;
        public CloseDealerHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<CloseDealerResponse>> Handle(CloseDealerCommand command, CancellationToken ct)
        {
            var dealer = await _db.Dealers
                .FirstOrDefaultAsync(d => d.DealerId == command.DealerId, ct);

            if (dealer is null) return Result.NotFound($"Dealer {command.DealerId} not found.");

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
                return Result.Error($"Cannot transit {current} → {DealerStatus.Closed}.");

            dealer.Status = DealerStatus.Closed.ToString();
            dealer.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            var response = new CloseDealerResponse
            {
                DealerId = dealer.DealerId,
                LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
            };
            return Result.Success(response);
        }

    }
}
