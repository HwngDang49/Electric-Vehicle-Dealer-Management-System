using Ardalis.Result;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.DealerAgreements.GetById
{
    public sealed class GetDealerAgreementByIdHandler : IRequestHandler<GetDealerAgreementByIdQuery, Result<GetDealerAgreementByIdResponse>>
    {
        private readonly EVDmsDbContext _db;

        public GetDealerAgreementByIdHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<GetDealerAgreementByIdResponse>> Handle(GetDealerAgreementByIdQuery request, CancellationToken ct)
        {
            var agreement = await _db.DealerAgreements
                .Include(a => a.AgreementRebates)
                .Where(a => a.AgreementId == request.AgreementId)
                .FirstOrDefaultAsync(ct);

            if (agreement == null)
                return Result.NotFound($"Agreement with id {request.AgreementId} not found.");

            var response = new GetDealerAgreementByIdResponse
            {
                AgreementId = agreement.AgreementId,
                DealerId = agreement.DealerId,
                Code = agreement.Code,
                Title = agreement.Title,
                StartDate = agreement.StartDate,
                EndDate = agreement.EndDate,
                PaymentTerms = agreement.PaymentTerms,
                Status = agreement.Status,
                FileUrl = agreement.FileUrl,
                CreatedAt = agreement.CreatedAt,
                AgreementRebates = agreement.AgreementRebates
                    .OrderByDescending(r => r.TierQty) // Tier cao nhất trước
                    .Select(r => new AgreementRebateDto
                    {
                        RebateId = r.RebateId,
                        Period = r.Period,
                        TierQty = r.TierQty,
                        RebatePerUnit = r.RebatePerUnit,
                        CapAmount = r.CapAmount,
                        CreatedAt = r.CreatedAt
                    })
                    .ToList()
            };

            return Result.Success(response);
        }
    }
}

