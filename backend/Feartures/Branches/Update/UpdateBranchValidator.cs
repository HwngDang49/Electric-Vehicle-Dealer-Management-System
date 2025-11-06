using System.Text.RegularExpressions;
using FluentValidation;

namespace backend.Feartures.Branches.Update;

public class UpdateBranchValidator : AbstractValidator<UpdateBranchCommand>
{
    public UpdateBranchValidator()
    {
        //  Code  
        // Code: VF-<CITY3>-<INDEX2,3> (ví dụ: VF-HNI-01, VF-HCM-123)  
        RuleFor(x => x.Body.Code)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("Mã chi nhánh không được để trống")
            .MaximumLength(50).WithMessage("Mã chi nhánh không được vượt quá 50 kí tự")
            .Must(v => !string.IsNullOrWhiteSpace(v) && v.Trim().ToUpperInvariant() == v.Trim().ToUpperInvariant())
            .Matches(@"^VF-[A-Z]{2,3}-\d{2,3}$")
            .WithMessage("Mã chi nhánh phải theo định dạng VF-<CITY3>-<INDEX2,3> (ví dụ: VF-HNI-01)");

        //  Name  
        RuleFor(x => x.Body.Name)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("Tên chi nhánh không được để trống")
            .MaximumLength(100).WithMessage("Tên chi nhánh không được vượt quá 100 kí tự")
            .Must(v => v != null && Regex.IsMatch(v.Trim(), @"^[\p{L}0-9 ]+$", RegexOptions.CultureInvariant))
            .WithMessage("Tên chi nhánh chỉ được chứa chữ cái, số và khoảng trắng");

        //  Status  
        RuleFor(x => x.Body.Status)
            .NotEmpty().WithMessage("Trạng thái chi nhánh không được để trống")
            .Must(status =>
                status == "Active" ||
                status == "Inactive" ||
                status == "Suspended" ||
                status == "Closed")
            .WithMessage("Trạng thái chi nhánh không hợp lệ. Chỉ cho phép: Active, Inactive, Suspended, Closed");

        // Address
        RuleFor(x => x.Body.Address)
            .MaximumLength(20)
            .WithMessage("Địa chỉ không được vượt quá 20 kí tự")
            .When(x => !string.IsNullOrWhiteSpace(x.Body.Address));
    }
}


