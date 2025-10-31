using FluentValidation;

namespace backend.Feartures.DealerAgreements.Create
{
    public class CreateDealerAgreementValidator : AbstractValidator<CreateDealerAgreementRequest>
    {
        public CreateDealerAgreementValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty().WithMessage("Code is required")
                .MaximumLength(50).WithMessage("Code cannot exceed 50 characters");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required")
                .MaximumLength(255).WithMessage("Title cannot exceed 255 characters");

            RuleFor(x => x.StartDate)
                .NotEmpty().WithMessage("StartDate is required");

            RuleFor(x => x.EndDate)
                .GreaterThan(x => x.StartDate)
                .When(x => x.EndDate.HasValue)
                .WithMessage("EndDate must be after StartDate");

            RuleFor(x => x.PaymentTerms)
                .MaximumLength(100).WithMessage("PaymentTerms cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.PaymentTerms));
        }
    }
}

