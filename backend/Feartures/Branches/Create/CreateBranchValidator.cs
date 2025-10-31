using backend.Domain.Enums;
using FluentValidation;

namespace backend.Feartures.Branches.Create;

public class CreateBranchValidator : AbstractValidator<CreateBranchCommand>
{
    public CreateBranchValidator()
    {
        //  Code
        RuleFor(x => x.Request.Code)
            .NotEmpty()
            .WithMessage("Branch code is required")
            .MaximumLength(50)
            .WithMessage("Branch code cannot exceed 50 characters");

        //  Name
        RuleFor(x => x.Request.Name)
            .NotEmpty()
            .WithMessage("Branch name is required")
            .MaximumLength(255)
            .WithMessage("Branch name cannot exceed 255 characters");

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

