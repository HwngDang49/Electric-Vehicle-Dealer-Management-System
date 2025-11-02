using System;
using Ardalis.Result;
using backend.Common.Auth;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Claims.GetMyClaimDetail
{
    public sealed class GetMyClaimDetailHandler : IRequestHandler<GetMyClaimDetailQuery, Result<GetMyClaimDetailDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetMyClaimDetailHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<GetMyClaimDetailDto>> Handle(GetMyClaimDetailQuery query, CancellationToken ct)
        {
            // Lấy DealerId từ token (DealerManager/DealerStaff)
            long dealerId;
            try
            {
                dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Result.Forbidden(ex.Message);
            }

            // Chỉ lấy claim của dealer này
            var claim = await _db.Claims
                .AsNoTracking()
                .Include(c => c.Dealer)
                .Include(c => c.Agreement)
                .Include(c => c.Settlements)
                .Where(c => c.ClaimId == query.ClaimId && c.DealerId == dealerId)
                .FirstOrDefaultAsync(ct);

            if (claim == null)
            {
                return Result.NotFound($"Claim {query.ClaimId} not found or you don't have permission to view it.");
            }

            // Chỉ tính settlements đã thanh toán thành công (có ReferenceNo)
            var totalPaid = claim.Settlements
                .Where(s => s.ReferenceNo != null && !string.IsNullOrWhiteSpace(s.ReferenceNo))
                .Sum(s => (decimal?)s.PaidAmount) ?? 0;
            var remainingAmount = claim.Amount - totalPaid;

            var dto = new GetMyClaimDetailDto
            {
                ClaimId = claim.ClaimId,
                DealerId = claim.DealerId,
                DealerName = claim.Dealer?.Name,
                AgreementId = claim.AgreementId,
                AgreementCode = claim.Agreement?.Code,
                Period = claim.Period,
                Amount = claim.Amount,
                Status = claim.Status,
                CreatedAt = claim.CreatedAt,
                ResolvedAt = claim.ResolvedAt,
                TotalPaid = totalPaid,
                RemainingAmount = remainingAmount,
                Settlements = claim.Settlements
                    .OrderByDescending(s => s.PaidAt)
                    .Select(s => new SettlementDto
                    {
                        SettlementId = s.SettlementId,
                        PaidAmount = s.PaidAmount,
                        PaidAt = s.PaidAt,
                        ReferenceNo = s.ReferenceNo
                    })
                    .ToList()
            };

            return Result.Success(dto);
        }
    }
}

