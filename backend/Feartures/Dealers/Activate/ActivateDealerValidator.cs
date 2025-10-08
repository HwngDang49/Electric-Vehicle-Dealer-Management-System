using FluentValidation;

namespace backend.Feartures.Dealers.Activate
{
    public class ActivateDealerValidator : AbstractValidator<ActivateDealerCommand>
    {
        public ActivateDealerValidator()
        {
            RuleFor(x => x.DealerId)
                .GreaterThan(0).WithMessage("DealerId must be greater than 0.");
        }
    }
}
