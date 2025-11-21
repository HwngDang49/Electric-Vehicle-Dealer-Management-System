using FluentValidation;
using backend.Infrastructure.Data;
using backend.Common.Validation;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace backend.Feartures.Dealers.Create
{
    public class CreateDealerValidator : AbstractValidator<CreateDealerCommand>
    {
        private readonly EVDmsDbContext _db;

        public CreateDealerValidator(EVDmsDbContext db)
        {
            _db = db;

            RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã Đại lí không được để trống")
            .MaximumLength(50).WithMessage("Mã Đại lí không được vượt quá 50 ký tự");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên Đại lí không được để trống")
                .MaximumLength(255).WithMessage("Tên Đại lí không được vượt quá 255 ký tự")
                .MustAsync(async (name, ct) =>
                {
                    if (string.IsNullOrWhiteSpace(name)) return true;
                    var normalizedName = name.Trim().ToLowerInvariant();
                    var existingDealers = await _db.Dealers
                        .Select(d => d.Name)
                        .ToListAsync(ct);
                    return !existingDealers.Any(d => 
                        !string.IsNullOrWhiteSpace(d) && 
                        d.Trim().ToLowerInvariant() == normalizedName);
                })
                .WithMessage("Tên đại lý đã tồn tại trong hệ thống");

            RuleFor(x => x.LegalName)
            .NotEmpty().WithMessage("Tên pháp lý không được để trống")
            .MaximumLength(500).WithMessage("Tên pháp lý không được vượt quá 500 ký tự")
            .MustAsync(async (legalName, ct) =>
            {
                if (string.IsNullOrWhiteSpace(legalName)) return true;
                var normalizedLegalName = legalName.Trim().ToLowerInvariant();
                var existingDealers = await _db.Dealers
                    .Select(d => d.LegalName)
                    .ToListAsync(ct);
                return !existingDealers.Any(d => 
                    d != null && 
                    d.Trim().ToLowerInvariant() == normalizedLegalName);
            })
            .WithMessage("Tên pháp lý đã tồn tại trong hệ thống");

            RuleFor(x => x.TaxId)
                .NotEmpty().WithMessage("Mã số thuế không được để trống")
                .MaximumLength(14).WithMessage("Mã số thuế không được vượt quá 14 ký tự")
                .Matches(RegexPatterns.VietnameseTaxId)
                .WithMessage("Mã số thuế phải có định dạng hợp lệ (XXXXXXXXXX-XXX)")
                .MustAsync(async (taxId, ct) =>
                {
                    if (string.IsNullOrWhiteSpace(taxId)) return true;
                    // Remove dashes and spaces for comparison
                    var normalizedTaxId = taxId.Replace("-", "").Replace(" ", "").Trim();
                    var existingDealers = await _db.Dealers
                        .Select(d => d.TaxId)
                        .ToListAsync(ct);
                    return !existingDealers.Any(d => 
                        d != null && 
                        d.Replace("-", "").Replace(" ", "").Trim() == normalizedTaxId);
                })
                .WithMessage("Mã số thuế đã tồn tại trong hệ thống");

            RuleFor(x => x.CreditLimit)
                .GreaterThanOrEqualTo(0).WithMessage("Credit limit không được là số âm");

            //status 400 -> nếu validation fails
        }
    }
}
