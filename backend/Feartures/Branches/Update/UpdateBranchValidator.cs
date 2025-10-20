using FluentValidation;

namespace backend.Feartures.Branches.Update;

public class UpdateBranchValidator : AbstractValidator<UpdateBranchRequest>
{
    public UpdateBranchValidator()
    {
        RuleFor(x => x.BranchId).GreaterThan(0);
        RuleFor(x => x.Code).NotEmpty().MinimumLength(2).MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MinimumLength(2).MaximumLength(200);
        RuleFor(x => x.Status).NotEmpty();
    }
}


