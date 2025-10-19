using FluentValidation;
using backend.Domain.Enums;

namespace backend.Feartures.Agreements.Create
{
    public class CreateAgreementValidator : AbstractValidator<CreateAgreementRequest>
    {
        public CreateAgreementValidator()
        {
            RuleFor(x => x.DealerId)
                .GreaterThan(0)
                .WithMessage("Dealer ID phải lớn hơn 0");

            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Mã Agreement không được để trống")
                .MaximumLength(50)
                .WithMessage("Mã Agreement không được vượt quá 50 ký tự");

            RuleFor(x => x.Title)
                .NotEmpty()
                .WithMessage("Tiêu đề Agreement không được để trống")
                .MaximumLength(255)
                .WithMessage("Tiêu đề Agreement không được vượt quá 255 ký tự");

            RuleFor(x => x.StartDate)
                .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
                .WithMessage("Ngày bắt đầu không được trong quá khứ");

            RuleFor(x => x.EndDate)
                .GreaterThan(x => x.StartDate)
                .When(x => x.EndDate.HasValue)
                .WithMessage("Ngày kết thúc phải sau ngày bắt đầu");

            RuleFor(x => x.Status)
                .IsInEnum()
                .WithMessage("Trạng thái Agreement không hợp lệ");

            RuleFor(x => x.RebateRules)
                .NotEmpty()
                .WithMessage("Agreement phải có ít nhất 1 Rebate rule");

            RuleForEach(x => x.RebateRules)
                .SetValidator(new CreateRebateRuleValidator());

            // Business Rule: Kiểm tra TierQty tăng dần
            RuleFor(x => x.RebateRules)
                .Must(rebates => 
                {
                    var sortedRebates = rebates.OrderBy(r => r.TierQty).ToList();
                    for (int i = 1; i < sortedRebates.Count; i++)
                    {
                        if (sortedRebates[i].TierQty <= sortedRebates[i-1].TierQty)
                            return false;
                    }
                    return true;
                })
                .WithMessage("TierQty phải tăng dần");

            // Business Rule: Kiểm tra RebatePerUnit tăng dần
            RuleFor(x => x.RebateRules)
                .Must(rebates => 
                {
                    var sortedRebates = rebates.OrderBy(r => r.TierQty).ToList();
                    for (int i = 1; i < sortedRebates.Count; i++)
                    {
                        if (sortedRebates[i].RebatePerUnit <= sortedRebates[i-1].RebatePerUnit)
                            return false;
                    }
                    return true;
                })
                .WithMessage("RebatePerUnit phải tăng dần theo tier");
        }
    }

    public class CreateRebateRuleValidator : AbstractValidator<CreateRebateRuleRequest>
    {
        public CreateRebateRuleValidator()
        {
            RuleFor(x => x.Period)
                .NotEmpty()
                .WithMessage("Period không được để trống")
                .Must(period => new[] { "Monthly", "Quarterly", "Yearly" }.Contains(period))
                .WithMessage("Period phải là Monthly, Quarterly hoặc Yearly");

            RuleFor(x => x.TierQty)
                .GreaterThan(0)
                .WithMessage("Tier Quantity phải lớn hơn 0");

            RuleFor(x => x.RebatePerUnit)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Rebate per unit phải lớn hơn hoặc bằng 0");

            RuleFor(x => x.CapAmount)
                .GreaterThan(0)
                .When(x => x.CapAmount.HasValue)
                .WithMessage("Cap amount phải lớn hơn 0");
        }
    }
}
