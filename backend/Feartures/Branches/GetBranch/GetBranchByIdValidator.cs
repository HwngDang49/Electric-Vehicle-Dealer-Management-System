using FluentValidation;

namespace backend.Feartures.Branches.GetBranch
{
    public class GetBranchByIdValidator : AbstractValidator<GetBranchByIdQuery>
    {
        public GetBranchByIdValidator()
        {
            RuleFor(x => x.BranchId)
                .GreaterThan(0).WithMessage("Mã đại lí không được là số âm");
        }
    }
}
