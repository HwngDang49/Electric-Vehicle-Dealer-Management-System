using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace backend.Feartures.Dealers.Activate
{
    public class ActivateDealerHandler : IRequestHandler<ActivateDealerCommand, Result<ActivateDealerResponse>>
    {
        private readonly EVDmsDbContext _db;

        public ActivateDealerHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<ActivateDealerResponse>> Handle(ActivateDealerCommand command, CancellationToken ct)
        {
            var dealer = await _db.Dealers
                .FirstOrDefaultAsync(d => d.DealerId == command.DealerId, ct);

            if (dealer is null)
                return Result.NotFound($"Dealer {command.DealerId} not found.");

            var current = Enum.Parse<DealerStatus>(dealer.Status);

            if (current == DealerStatus.Live)
                return Result.Success(new ActivateDealerResponse
                {
                    DealerId = dealer.DealerId,
                    LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
                });

            if (!DealerStatusRules.CanTransit(current, DealerStatus.Live))
                return Result.Conflict($"Cannot transit {current} → {DealerStatus.Live}.");

            dealer.Status = DealerStatus.Live.ToString();
            dealer.UpdatedAt = DateTime.UtcNow;

            // ✅ Don't call SaveChangesAsync here - TransactionBehavior will handle it
            // await _db.SaveChangesAsync(ct);

            var response = new ActivateDealerResponse
            {
                DealerId = dealer.DealerId,
                LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
            };


            return Result.Success(response);
        }
    }
}
