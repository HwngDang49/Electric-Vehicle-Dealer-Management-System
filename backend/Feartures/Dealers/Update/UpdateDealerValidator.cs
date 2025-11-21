using FluentValidation;
using backend.Infrastructure.Data;
using backend.Common.Validation;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace backend.Feartures.Dealers.Update
{
    //AbstractValidator<T> là một lớp cơ sở trong thư viện FluentValidation được sử dụng để tạo các trình xác thực (validators) cho các kiểu dữ liệu cụ thể.
    // Khi bạn kế thừa từ AbstractValidator<T>, bạn có thể định nghĩa các quy tắc xác thực cho các thuộc tính của kiểu dữ liệu T.
    public class UpdateDealerValidator : AbstractValidator<UpdateDealerCommand>
    {
        private readonly EVDmsDbContext _db;

        public UpdateDealerValidator(EVDmsDbContext db)
        {
            _db = db;

            RuleFor(x => x.DealerId).GreaterThan(0);

            RuleFor(x => x.Body.Code)
                .NotEmpty().WithMessage("Mã Đại lí không được để trống")
                .When(x => !string.IsNullOrWhiteSpace(x.Body.Code))
                .MaximumLength(50).WithMessage("Mã Đại lí không được vượt quá 50 ký tự")
                .When(x => !string.IsNullOrWhiteSpace(x.Body.Code));

            RuleFor(x => x.Body.Name)
                .NotEmpty().WithMessage("Tên Đại lí không được để trống")
                .When(x => !string.IsNullOrWhiteSpace(x.Body.Name))
                .MaximumLength(255).WithMessage("Tên Đại lí không được vượt quá 255 ký tự")
                .When(x => !string.IsNullOrWhiteSpace(x.Body.Name))
                .MustAsync(async (cmd, name, ct) =>
                {
                    if (string.IsNullOrWhiteSpace(name)) return true;
                    var normalizedName = name.Trim().ToLowerInvariant();
                    var existingDealers = await _db.Dealers
                        .Where(d => d.DealerId != cmd.DealerId) // Exclude current dealer
                        .Select(d => d.Name)
                        .ToListAsync(ct);
                    return !existingDealers.Any(d => 
                        !string.IsNullOrWhiteSpace(d) && 
                        d.Trim().ToLowerInvariant() == normalizedName);
                })
                .When(x => !string.IsNullOrWhiteSpace(x.Body.Name))
                .WithMessage("Tên đại lý đã tồn tại trong hệ thống");

            RuleFor(x => x.Body.LegalName)
                .NotEmpty().WithMessage("Tên pháp lý không được để trống")
                .When(x => !string.IsNullOrWhiteSpace(x.Body.LegalName))
                .MaximumLength(500).WithMessage("Tên pháp lý không được vượt quá 500 ký tự")
                .When(x => !string.IsNullOrWhiteSpace(x.Body.LegalName))
                .MustAsync(async (cmd, legalName, ct) =>
                {
                    if (string.IsNullOrWhiteSpace(legalName)) return true;
                    var normalizedLegalName = legalName.Trim().ToLowerInvariant();
                    var existingDealers = await _db.Dealers
                        .Where(d => d.DealerId != cmd.DealerId) // Exclude current dealer
                        .Select(d => d.LegalName)
                        .ToListAsync(ct);
                    return !existingDealers.Any(d => 
                        d != null && 
                        d.Trim().ToLowerInvariant() == normalizedLegalName);
                })
                .When(x => !string.IsNullOrWhiteSpace(x.Body.LegalName))
                .WithMessage("Tên pháp lý đã tồn tại trong hệ thống");

            RuleFor(x => x.Body.TaxId)
                .NotEmpty().WithMessage("Mã số thuế không được để trống")
                .When(x => !string.IsNullOrWhiteSpace(x.Body.TaxId))
                .MaximumLength(14).WithMessage("Mã số thuế không được vượt quá 14 ký tự")
                .When(x => !string.IsNullOrWhiteSpace(x.Body.TaxId))
                .Matches(RegexPatterns.VietnameseTaxId)
                .WithMessage("Mã số thuế phải có định dạng hợp lệ (XXXXXXXXXX-XXX)")
                .When(x => !string.IsNullOrWhiteSpace(x.Body.TaxId))
                .MustAsync(async (cmd, taxId, ct) =>
                {
                    if (string.IsNullOrWhiteSpace(taxId)) return true;
                    // Remove dashes and spaces for comparison
                    var normalizedTaxId = taxId.Replace("-", "").Replace(" ", "").Trim();
                    var existingDealers = await _db.Dealers
                        .Where(d => d.DealerId != cmd.DealerId) // Exclude current dealer
                        .Select(d => d.TaxId)
                        .ToListAsync(ct);
                    return !existingDealers.Any(d => 
                        d != null && 
                        d.Replace("-", "").Replace(" ", "").Trim() == normalizedTaxId);
                })
                .When(x => !string.IsNullOrWhiteSpace(x.Body.TaxId))
                .WithMessage("Mã số thuế đã tồn tại trong hệ thống");

            RuleFor(x => x.Body.CreditLimit)
                .GreaterThanOrEqualTo(0).WithMessage("Credit limit không được là số âm")
                .When(x => x.Body.CreditLimit.HasValue);
        }
    }
}
