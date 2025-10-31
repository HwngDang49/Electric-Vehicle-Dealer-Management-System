using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Enums;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.DealerAgreements.Create
{
    public sealed class CreateDealerAgreementHandler : IRequestHandler<CreateDealerAgreementCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreateDealerAgreementHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<long>> Handle(CreateDealerAgreementCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // 0. CHỈ ADMIN MỚI ĐƯỢC TẠO AGREEMENT
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();
            if (userRole != Role.Admin.ToString())
            {
                return Result.Forbidden("Chỉ Admin mới được tạo hợp đồng rebate");
            }

            // 1. Validate: Code unique
            var codeExists = await _db.DealerAgreements
                .AsNoTracking()
                .AnyAsync(a => a.Code == req.Code, ct);

            if (codeExists)
                return Result.Error($"Agreement code '{req.Code}' already exists.");

            // 2. Validate: StartDate < EndDate (nếu có EndDate)
            if (req.EndDate.HasValue && req.StartDate >= req.EndDate.Value)
                return Result.Error("StartDate must be before EndDate.");

            // 3. Validate: Dealer exists
            var dealerExists = await _db.Dealers
                .AsNoTracking()
                .AnyAsync(d => d.DealerId == req.DealerId, ct);

            if (!dealerExists)
                return Result.NotFound($"Dealer {req.DealerId} not found.");

            // 4. CRITICAL: Check if dealer already has Active agreement
            var existingActive = await _db.DealerAgreements
                .AsNoTracking()
                .Where(a => a.DealerId == req.DealerId && a.Status == "Active")
                .FirstOrDefaultAsync(ct);

            if (existingActive != null)
            {
                return Result.Error(
                    $"Dealer đã có hợp đồng Active: {existingActive.Code} " +
                    $"({existingActive.StartDate} - {existingActive.EndDate}). " +
                    "Vui lòng đóng hợp đồng cũ trước khi tạo mới."
                );
            }

            // 5. Create new agreement
            var agreement = new DealerAgreement
            {
                DealerId = req.DealerId,
                Code = req.Code,
                Title = req.Title,
                StartDate = req.StartDate,
                EndDate = req.EndDate,
                PaymentTerms = req.PaymentTerms,
                FileUrl = req.FileUrl,
                Status = "Active", // Set Active since we already checked no Active exists
                CreatedAt = DateTime.UtcNow
            };

            _db.DealerAgreements.Add(agreement);
            await _db.SaveChangesAsync(ct);

            return Result.Success(agreement.AgreementId);
        }
    }
}

