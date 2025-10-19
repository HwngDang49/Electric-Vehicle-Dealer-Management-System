using Ardalis.Result;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Agreements.Create
{
    public record CreateAgreementCommand(CreateAgreementRequest Request) : IRequest<Result<long>>;

    public class CreateAgreementHandler : IRequestHandler<CreateAgreementCommand, Result<long>>
    {
        private readonly EVDmsDbContext _dbContext;

        public CreateAgreementHandler(EVDmsDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Result<long>> Handle(CreateAgreementCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // Business Rule: Kiểm tra Dealer có tồn tại không
            var dealerExists = await _dbContext.Dealers
                .AnyAsync(d => d.DealerId == req.DealerId, ct);
            if (!dealerExists)
                return Result.Error("Dealer không tồn tại");

            // Business Rule: Kiểm tra Dealer đã có Agreement Active chưa
            var existingActiveAgreement = await _dbContext.DealerAgreements
                .AnyAsync(a => a.DealerId == req.DealerId && a.Status == "Active", ct);
            if (existingActiveAgreement)
                return Result.Error("Dealer đã có Agreement Active. Không thể tạo Agreement mới");

            // Business Rule: Kiểm tra Code Agreement đã tồn tại chưa
            var codeExists = await _dbContext.DealerAgreements
                .AnyAsync(a => a.Code == req.Code, ct);
            if (codeExists)
                return Result.Error($"Mã Agreement '{req.Code}' đã tồn tại");

            // Tạo Agreement
            var agreement = new DealerAgreement
            {
                DealerId = req.DealerId,
                Code = req.Code,
                Title = req.Title,
                StartDate = req.StartDate,
                EndDate = req.EndDate,
                PaymentTerms = req.PaymentTerms,
                Status = req.Status.ToString(),
                FileUrl = req.FileUrl,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.DealerAgreements.Add(agreement);
            await _dbContext.SaveChangesAsync(ct);

            // Tạo Rebate Rules
            foreach (var rebateRule in req.RebateRules)
            {
                var agreementRebate = new AgreementRebate
                {
                    AgreementId = agreement.AgreementId,
                    Period = rebateRule.Period,
                    TierQty = rebateRule.TierQty,
                    RebatePerUnit = rebateRule.RebatePerUnit,
                    CapAmount = rebateRule.CapAmount,
                    CreatedAt = DateTime.UtcNow
                };

                _dbContext.AgreementRebates.Add(agreementRebate);
            }

            await _dbContext.SaveChangesAsync(ct);

            return Result.Success(agreement.AgreementId);
        }
    }
}
