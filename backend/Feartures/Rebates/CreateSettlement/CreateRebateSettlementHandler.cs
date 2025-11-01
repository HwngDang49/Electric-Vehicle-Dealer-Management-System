using Ardalis.Result;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Rebates.CreateSettlement
{
    public record CreateRebateSettlementCommand(CreateRebateSettlementRequest Request) : IRequest<Result<long>>;

    public class CreateRebateSettlementHandler : IRequestHandler<CreateRebateSettlementCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;

        public CreateRebateSettlementHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<long>> Handle(CreateRebateSettlementCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // check xem claim có tồn tại và là rebate claim không
            var claim = await _db.Claims
                .Include(c => c.Settlements)
                .FirstOrDefaultAsync(c => c.ClaimId == req.ClaimId
                                       && c.AgreementId != null, ct);

            if (claim == null)
            {
                return Result.NotFound($"Rebate Claim {req.ClaimId} not found.");
            }

            // check amount
            if (req.PaidAmount <= 0)
            {
                return Result.Error("Paid amount must be greater than 0.");
            }

            // Tính tổng đã thanh toán hiện tại
            var totalPaidSoFar = claim.Settlements.Sum(s => s.PaidAmount);

            //PaidAmount không được vượt quá Claim.Amount - TotalPaid
            var remainingAmount = claim.Amount - totalPaidSoFar;
            if (req.PaidAmount > remainingAmount)
            {
                return Result.Error(
                    $"Paid amount exceeds claim amount."
                );
            }

            // Tạo Settlement
            var settlement = new Settlement
            {
                ClaimId = req.ClaimId,
                PaidAmount = req.PaidAmount,
                PaidAt = DateTime.UtcNow,
                ReferenceNo = req.ReferenceNo
            };

            _db.Settlements.Add(settlement);

            // Cập nhật Claim Status nếu tổng thanh toán đã đủ
            var newTotalPaid = totalPaidSoFar + req.PaidAmount;
            if (newTotalPaid >= claim.Amount && claim.Status == "Pending")
            {
                // Claim đã được thanh toán đầy đủ
                claim.Status = "Paid";
                claim.ResolvedAt = DateTime.UtcNow;
            }
            else if (newTotalPaid > 0 && claim.Status == "Pending")
            {
                // Claim đang được thanh toán một phần
                claim.Status = "Processing";
            }

            await _db.SaveChangesAsync(ct);

            return Result.Success(settlement.SettlementId);
        }
    }
}

