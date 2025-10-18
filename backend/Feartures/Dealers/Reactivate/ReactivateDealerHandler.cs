using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Reactivate
{
    public class ReactivateDealerHandler : IRequestHandler<ReactivateDealerCommand, Result>
    {
        private readonly EVDmsDbContext _db;

        public ReactivateDealerHandler(EVDmsDbContext db) => _db = db;

        public async Task<Result> Handle(ReactivateDealerCommand request, CancellationToken ct)
        {
            var dealer = await _db.Dealers
                .FirstOrDefaultAsync(d => d.DealerId == request.DealerId, ct);
            if (dealer is null) return Result.NotFound($"Dealer {request.DealerId} not found.");

            var current = Enum.Parse<DealerStatus>(dealer.Status); // partial bọc string->enum
            if (!DealerStatusRules.CanTransit(current, DealerStatus.Live))
                return Result.Error($"Cannot transit {current} → {DealerStatus.Live}.");

            dealer.Status = DealerStatus.Live.ToString();

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }

    }
}
