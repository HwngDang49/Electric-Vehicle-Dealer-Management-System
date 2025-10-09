using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Close
{
    public class CloseDealerHandler : IRequestHandler<CloseDealerCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        public CloseDealerHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result> Handle(CloseDealerCommand request, CancellationToken ct)
        {
            var dealer = await _db.Dealers
                .FirstOrDefaultAsync(d => d.DealerId == request.DealerId, ct);

            if (dealer is null) return Result.NotFound($"Dealer {request.DealerId} not found.");

            var current = dealer.StatusEnum; // partial property từ Dealer.Partial.cs
            if (!DealerStatusRules.CanTransit(current, DealerStatus.Closed))
                return Result.Error($"Cannot transit {current} → {DealerStatus.Closed}.");

            dealer.StatusEnum = DealerStatus.Closed;
            dealer.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }

    }
}
