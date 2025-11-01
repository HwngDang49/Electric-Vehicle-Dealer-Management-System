using FluentValidation;

namespace backend.Feartures.Rebates.CreateSettlement
{
    public class CreateRebateSettlementValidator : AbstractValidator<CreateRebateSettlementRequest>
    {
        public CreateRebateSettlementValidator()
        {
            RuleFor(x => x.ClaimId)
                .GreaterThan(0).WithMessage("Claim ID must be greater than 0.");

            RuleFor(x => x.PaidAmount)
                .GreaterThan(0).WithMessage("Paid amount must be greater than 0.");

            RuleFor(x => x.ReferenceNo)
                .MaximumLength(100)
                .When(x => !string.IsNullOrWhiteSpace(x.ReferenceNo))
                .WithMessage("Reference number cannot exceed 100 characters."); 
        }
    }
}

