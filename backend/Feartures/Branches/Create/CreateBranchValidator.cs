using System.Text.RegularExpressions;
using FluentValidation;

namespace backend.Feartures.Branches.Create;

public class CreateBranchValidator : AbstractValidator<CreateBranchCommand>
{
    public CreateBranchValidator()
    {
        //  Code  
        // Code: VF-<CITY3>-<INDEX2,3> (ví dụ: VF-HNI-01, VF-HCM-123)  
        RuleFor(x => x.Code)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("Mã chi nhánh không được để trống")
            .MaximumLength(50).WithMessage("Mã chi nhánh không được vượt quá 50 kí tự")
            .Must(v => !string.IsNullOrWhiteSpace(v) && v.Trim().ToUpperInvariant() == v.Trim().ToUpperInvariant())
            .Matches(@"^VF-[A-Z]{2,3}-\d{2,3}$")
            .WithMessage("Mã chi nhánh phải theo định dạng VF-<CITY3>-<INDEX2,3> (ví dụ: VF-HNI-01)");

        //  Name  
        RuleFor(x => x.Name)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("Tên chi nhánh không được để trống")
            .MaximumLength(100).WithMessage("Tên chi nhánh không được vượt quá 100 kí tự")
            .Must(v => v != null && Regex.IsMatch(v.Trim(), @"^[\p{L}0-9 ]+$", RegexOptions.CultureInvariant))
            .WithMessage("Tên chi nhánh chỉ được chứa chữ cái, số và khoảng trắng");

        //  Status  
        RuleFor(x => x.Status)
            .IsInEnum()
            .WithMessage("Trạng thái chi nhánh không hợp lệ");

        //  DealerId  
        RuleFor(x => x.DealerId)
            .NotEmpty()
            .WithMessage("Mã Dealer không được để trống")
            .GreaterThan(0)
            .WithMessage("Mã dealer không được là số âm");

        // Address   
        RuleFor(x => x.Address)
            .NotEmpty()
            .WithMessage("Địa chỉ không được để trống")
            .MaximumLength(80)
            .WithMessage("Địa chỉ không được vượt quá 80 kí tự");
    }
}

