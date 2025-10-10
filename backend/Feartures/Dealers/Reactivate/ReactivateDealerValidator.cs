using FluentValidation;

namespace backend.Feartures.Dealers.Reactivate
{
    public class ReactivateDealerValidator : AbstractValidator<ReactivateDealerCommand>
    {
        public ReactivateDealerValidator()
        {
            RuleFor(x => x.DealerId).GreaterThan(0).WithMessage("DealerId must be greater than 0");
        }
    }
}
