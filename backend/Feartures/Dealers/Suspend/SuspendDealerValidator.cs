using FluentValidation;

namespace backend.Feartures.Dealers.Suspend
{
    public class SuspendDealerValidator : AbstractValidator<SuspendDealerCommand>
    {
        public SuspendDealerValidator()
        {
            RuleFor(x => x.DealerId).GreaterThan(0).WithMessage("DealerId must be greater than 0");
        }
    }
}
