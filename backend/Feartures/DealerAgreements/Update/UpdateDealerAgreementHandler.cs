using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Enums;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.DealerAgreements.Update
{
    public sealed class UpdateDealerAgreementHandler : IRequestHandler<UpdateDealerAgreementCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateDealerAgreementHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result> Handle(UpdateDealerAgreementCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // 0. CHỈ ADMIN MỚI ĐƯỢC UPDATE AGREEMENT
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();
            if (userRole != Role.Admin.ToString())
            {
                return Result.Forbidden("Chỉ Admin mới được cập nhật hợp đồng rebate");
            }

            // 1. Find agreement
            var agreement = await _db.DealerAgreements
                .FirstOrDefaultAsync(a => a.AgreementId == cmd.AgreementId, ct);

            if (agreement == null)
                return Result.NotFound($"Agreement {cmd.AgreementId} not found.");

            // 2. Validate: Code unique (nếu đổi code)
            if (!string.IsNullOrWhiteSpace(req.Code) && req.Code != agreement.Code)
            {
                var codeExists = await _db.DealerAgreements
                    .AsNoTracking()
                    .AnyAsync(a => a.Code == req.Code && a.AgreementId != cmd.AgreementId, ct);

                if (codeExists)
                    return Result.Error($"Agreement code '{req.Code}' already exists.");
            }

            // 3. Validate: StartDate < EndDate
            var startDate = req.StartDate ?? agreement.StartDate;
            var endDate = req.EndDate ?? agreement.EndDate;
            if (endDate.HasValue && startDate >= endDate.Value)
                return Result.Error("StartDate must be before EndDate.");

            // 4. BUSINESS RULES: Restrict updates based on current status
            // 4a. Inactive/Expired: Không được sửa gì cả
            if (agreement.Status == "Inactive" || agreement.Status == "Expired")
            {
                return Result.Error($"Không thể chỉnh sửa hợp đồng có trạng thái '{agreement.Status}'. Hợp đồng đã được đóng.");
            }

            // 4b. Active: Chỉ được sửa một số fields nhất định
            if (agreement.Status == "Active")
            {
                // Validate: Code không được đổi
                if (!string.IsNullOrWhiteSpace(req.Code) && req.Code != agreement.Code)
                {
                    return Result.Error("Không thể thay đổi Code của hợp đồng đang Active.");
                }

                // Validate: StartDate không được đổi
                if (req.StartDate.HasValue && req.StartDate.Value != agreement.StartDate)
                {
                    return Result.Error("Không thể thay đổi StartDate của hợp đồng đang Active.");
                }

                // Validate: EndDate chỉ được extend (không được rút ngắn)
                if (req.EndDate.HasValue && agreement.EndDate.HasValue)
                {
                    if (req.EndDate.Value < agreement.EndDate.Value)
                    {
                        return Result.Error("EndDate chỉ được gia hạn, không được rút ngắn khi hợp đồng đang Active.");
                    }
                }

                // Validate: Status không được đổi trực tiếp (phải dùng Close action)
                if (!string.IsNullOrWhiteSpace(req.Status) && req.Status != "Active")
                {
                    return Result.Error("Không thể thay đổi Status từ Active. Vui lòng sử dụng chức năng 'Đóng hợp đồng'.");
                }

                // Chỉ update các fields được phép
                if (!string.IsNullOrWhiteSpace(req.Title))
                    agreement.Title = req.Title;

                if (req.EndDate.HasValue)
                    agreement.EndDate = req.EndDate; // Only extend

                if (req.PaymentTerms != null)
                    agreement.PaymentTerms = req.PaymentTerms;

                if (req.FileUrl != null)
                    agreement.FileUrl = req.FileUrl;

                // Save và return (không update Status, Code, StartDate)
                await _db.SaveChangesAsync(ct);
                return Result.Success();
            }

            // 4c. Draft: Được sửa tất cả fields
            // (agreement.Status == "Draft")

            // 4d. CRITICAL: Nếu set Status = "Active" từ Draft → tự động đóng các agreement Active khác của cùng dealer
            var isSettingActive = !string.IsNullOrWhiteSpace(req.Status) && req.Status == "Active" && agreement.Status != "Active";
            if (isSettingActive)
            {
                var otherActive = await _db.DealerAgreements
                    .Where(a => a.DealerId == agreement.DealerId
                                && a.Status == "Active"
                                && a.AgreementId != cmd.AgreementId)
                    .ToListAsync(ct);

                foreach (var oldAgreement in otherActive)
                {
                    oldAgreement.Status = "Expired";
                }
            }

            // 5. Update properties (chỉ khi Status = Draft)
            if (!string.IsNullOrWhiteSpace(req.Code))
                agreement.Code = req.Code;

            if (!string.IsNullOrWhiteSpace(req.Title))
                agreement.Title = req.Title;

            if (req.StartDate.HasValue)
                agreement.StartDate = req.StartDate.Value;

            if (req.EndDate.HasValue)
                agreement.EndDate = req.EndDate;
            else if (req.EndDate == null && req.StartDate.HasValue)
                agreement.EndDate = null; // Allow clearing EndDate

            if (req.PaymentTerms != null)
                agreement.PaymentTerms = req.PaymentTerms;

            if (req.FileUrl != null)
                agreement.FileUrl = req.FileUrl;

            if (!string.IsNullOrWhiteSpace(req.Status))
                agreement.Status = req.Status;

            // 6. Save changes
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}

