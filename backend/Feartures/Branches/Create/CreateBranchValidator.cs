using FluentValidation;

namespace backend.Feartures.Branches.Create;

public class CreateBranchValidator : AbstractValidator<CreateBranchCommand>
{
    public CreateBranchValidator()
    {
        //  Code
        RuleFor(x => x.Request.Code)
            .NotEmpty()
            .WithMessage("Mã chi nhánh không được để trống")
            .MaximumLength(50)
            .WithMessage("Mã chi nhánh không được vượt quá 50 kí tự");

        //  Name
        RuleFor(x => x.Request.Name)
            .NotEmpty()
            .WithMessage("Tên chi nhánh không được để trống")
            .MaximumLength(100)
            .WithMessage("Tên chi nhánh không được vượt quá 100 kí tự");

        //  Status
        RuleFor(x => x.Request.Status)
            .IsInEnum()
            .WithMessage("Branch status must be valid (Active or Inactive)");

        //  DealerId
        RuleFor(x => x.Request.DealerId)
            .GreaterThan(0)
            .WithMessage("DealerId is required and must be greater than 0");

        // Address 
        RuleFor(x => x.Request.Address)
            .NotEmpty()
            .WithMessage("Address is required")
            .MaximumLength(500)
            .WithMessage("Address cannot exceed 500 characters");
    }
}

