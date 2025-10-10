using FluentValidation;

namespace backend.Feartures.Dealers.Close
{
    public class CloseDealerValidator : AbstractValidator<CloseDealerCommand>
    {
        public CloseDealerValidator()
        {
            RuleFor(x => x.DealerId).GreaterThan(0).WithMessage("DealerId must be greater than 0");
        }
    }
}
