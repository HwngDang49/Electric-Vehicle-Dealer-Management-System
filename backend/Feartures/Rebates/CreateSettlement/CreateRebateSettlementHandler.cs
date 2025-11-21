using Ardalis.Result;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using backend.Infrastructure.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Rebates.CreateSettlement
{
    public record CreateRebateSettlementCommand(CreateRebateSettlementRequest Request) : IRequest<Result<long>>;

    public class CreateRebateSettlementHandler : IRequestHandler<CreateRebateSettlementCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;
        private readonly NotificationService _notificationService;

        public CreateRebateSettlementHandler(EVDmsDbContext db, NotificationService notificationService)
        {
            _db = db;
            _notificationService = notificationService;
        }

        public async Task<Result<long>> Handle(CreateRebateSettlementCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // check xem claim có tồn tại và là rebate claim không
            // Include Dealer để có thể cập nhật WalletBalance
            var claim = await _db.Claims
                .Include(c => c.Settlements)
                .Include(c => c.Dealer)
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
            // CHECK constraint chỉ cho phép: Pending, Approved, Rejected, Settled
            var newTotalPaid = totalPaidSoFar + req.PaidAmount;
            if (newTotalPaid >= claim.Amount && (claim.Status == "Pending" || claim.Status == "Approved"))
            {
                // Claim đã được thanh toán đầy đủ -> Settled
                claim.Status = "Settled";
                claim.ResolvedAt = DateTime.UtcNow;
            }
            // Nếu đã thanh toán một phần, giữ nguyên status hiện tại (Pending/Approved)

            // Cộng tiền vào walletBalance của dealer khi thanh toán claim
            if (claim.Dealer != null)
            {
                claim.Dealer.WalletBalance += req.PaidAmount;
            }

            await _db.SaveChangesAsync(ct);

            // Send notification to Dealer Manager about claim settlement
            try
            {
                var isFullySettled = newTotalPaid >= claim.Amount;
                await _notificationService.NotifyClaimSettled(
                    claim.ClaimId,
                    claim.DealerId,
                    req.PaidAmount,
                    claim.Amount,
                    claim.Period ?? "",
                    settlement.PaidAt,
                    isFullySettled
                );
            }
            catch (Exception ex)
            {
                // Log error but don't fail the settlement creation
                Console.WriteLine($"[CreateRebateSettlementHandler] Error sending claim settlement notification: {ex.Message}");
            }

            // Send notification to Dealer Manager about credit update (WalletBalance increased)
            try
            {
                var dealer = await _db.Dealers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.DealerId == claim.DealerId, ct);
                
                if (dealer != null)
                {
                    var creditAvailable = dealer.CreditLimit - dealer.CreditUsed;
                    await _notificationService.NotifyDealerCreditUpdated(
                        dealer.DealerId,
                        dealer.CreditLimit,
                        dealer.CreditUsed,
                        creditAvailable,
                        dealer.WalletBalance
                    );
                }
            }
            catch (Exception ex)
            {
                // Log error but don't fail the settlement creation
                Console.WriteLine($"[CreateRebateSettlementHandler] Error sending credit update notification: {ex.Message}");
            }

            return Result.Success(settlement.SettlementId);
        }
    }
}

