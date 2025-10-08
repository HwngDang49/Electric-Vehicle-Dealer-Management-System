using FluentValidation;
namespace backend.Feartures.Dealers.Create
{
    public class CreateDealerValidator : AbstractValidator<CreateDealerRequest>
    {
        public CreateDealerValidator()
        {
            RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Dealer code is required.")
            .MaximumLength(50);

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Dealer name is required.")
                .MaximumLength(255);

            RuleFor(x => x.LegalName)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.LegalName));

            RuleFor(x => x.TaxId)
                .MaximumLength(50).When(x => !string.IsNullOrEmpty(x.TaxId));

            RuleFor(x => x.CreditLimit)
                .GreaterThanOrEqualTo(0).WithMessage("Credit limit cannot be negative.");

            //status 400 -> nếu validation fails
        }
    }
}
