using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Reactivate
{
    public class ReactivateDealerHandler : IRequestHandler<ReactivateDealerCommand, Result<ReactivateDealerResponse>>
    {
        private readonly EVDmsDbContext _db;

        public ReactivateDealerHandler(EVDmsDbContext db) => _db = db;

        public async Task<Result<ReactivateDealerResponse>> Handle(ReactivateDealerCommand request, CancellationToken ct)
        {
            var dealer = await _db.Dealers
                .FirstOrDefaultAsync(d => d.DealerId == request.DealerId, ct);

            if (dealer is null) return Result.NotFound($"Dealer {request.DealerId} not found.");

            var current = Enum.Parse<DealerStatus>(dealer.Status);

            if (current == DealerStatus.Live)
            {
                return Result.Error("Dealer is already in Live status.");
            }

            if (!DealerStatusRules.CanTransit(current, DealerStatus.Live))
                return Result.Error($"Cannot transit {current} → {DealerStatus.Live}.");

            dealer.Status = DealerStatus.Live.ToString();
            dealer.UpdatedAt = DateTime.UtcNow;

            // ✅ Don't call SaveChangesAsync here - TransactionBehavior will handle it
            // await _db.SaveChangesAsync(ct);

            var response = new ReactivateDealerResponse
            {
                DealerId = dealer.DealerId,
                LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
            };

            return Result.Success(response);
        }

    }
}
