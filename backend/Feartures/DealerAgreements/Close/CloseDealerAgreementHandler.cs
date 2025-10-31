using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.DealerAgreements.Close
{
    public sealed class CloseDealerAgreementHandler : IRequestHandler<CloseDealerAgreementCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CloseDealerAgreementHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result> Handle(CloseDealerAgreementCommand cmd, CancellationToken ct)
        {
            // 0. CHỈ ADMIN MỚI ĐƯỢC ĐÓNG AGREEMENT
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();
            if (userRole != Role.Admin.ToString())
            {
                return Result.Forbidden("Chỉ Admin mới được đóng hợp đồng rebate");
            }

            // 1. Find agreement
            var agreement = await _db.DealerAgreements
                .FirstOrDefaultAsync(a => a.AgreementId == cmd.AgreementId, ct);

            if (agreement == null)
                return Result.NotFound($"Agreement {cmd.AgreementId} not found.");

            // 2. Chỉ đóng được agreement có Status = "Active"
            if (agreement.Status != "Active")
            {
                return Result.Error($"Chỉ có thể đóng hợp đồng đang Active. Hiện tại: {agreement.Status}");
            }

            // 3. Đóng agreement
            agreement.Status = "Expired";
            agreement.EndDate = DateOnly.FromDateTime(DateTime.UtcNow); // Set EndDate = hôm nay

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}

