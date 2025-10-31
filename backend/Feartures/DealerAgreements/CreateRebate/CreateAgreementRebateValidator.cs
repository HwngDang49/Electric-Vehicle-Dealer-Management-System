using FluentValidation;

namespace backend.Feartures.DealerAgreements.CreateRebate
{
    public class CreateAgreementRebateValidator : AbstractValidator<CreateAgreementRebateRequest>
    {
        public CreateAgreementRebateValidator()
        {
            RuleFor(x => x.Period)
                .NotEmpty().WithMessage("Kỳ rebate không được để trống.")
                .MaximumLength(20).WithMessage("Kỳ rebate không được vượt quá 20 ký tự.");

            RuleFor(x => x.TierQty)
                .GreaterThan(0).WithMessage("Số lượng tier phải lớn hơn 0.");

            RuleFor(x => x.RebatePerUnit)
                .GreaterThanOrEqualTo(0).WithMessage("Rebate per unit phải >= 0.");

            RuleFor(x => x.CapAmount)
                .GreaterThanOrEqualTo(0)
                .When(x => x.CapAmount.HasValue)
                .WithMessage("Cap amount phải >= 0.");
        }
    }
}

