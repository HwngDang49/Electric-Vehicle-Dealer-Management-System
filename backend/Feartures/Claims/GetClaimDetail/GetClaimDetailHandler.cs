using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Claims.GetClaimDetail
{
    public sealed class GetClaimDetailHandler : IRequestHandler<GetClaimDetailQuery, Result<GetClaimDetailDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetClaimDetailHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<GetClaimDetailDto>> Handle(GetClaimDetailQuery query, CancellationToken ct)
        {
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();

            // Permission: Chỉ Admin và EVM Staff mới được xem chi tiết claims
            if (userRole != Role.Admin.ToString() && userRole != Role.EVMStaff.ToString())
            {
                return Result.Forbidden("Chỉ Admin hoặc EVM Staff mới được xem chi tiết claim.");
            }

            var claim = await _db.Claims
                .AsNoTracking()
                .Include(c => c.Dealer)
                .Include(c => c.Agreement)
                .Include(c => c.Settlements)
                .Where(c => c.ClaimId == query.ClaimId)
                .FirstOrDefaultAsync(ct);

            if (claim == null)
            {
                return Result.NotFound($"Claim {query.ClaimId} not found.");
            }

            // Chỉ tính settlements đã thanh toán thành công (có ReferenceNo)
            var totalPaid = claim.Settlements
                .Where(s => s.ReferenceNo != null && !string.IsNullOrWhiteSpace(s.ReferenceNo))
                .Sum(s => (decimal?)s.PaidAmount) ?? 0;
            var remainingAmount = claim.Amount - totalPaid;

            var dto = new GetClaimDetailDto
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

