using backend.Domain.Enums;
using FluentValidation;

namespace backend.Feartures.Promotions.Create
{
    public class CreatePromotionValidator : AbstractValidator<CreatePromotionCommand>
    {
        public CreatePromotionValidator()
        {
            RuleFor(x => x.Request.Name)
                .NotEmpty()
                .WithMessage("Tên promotion không được để trống")
                .MaximumLength(255)
                .WithMessage("Tên promotion không được vượt quá 255 ký tự");

            RuleFor(x => x.Request.AmountOff)
                .GreaterThan(0)
                .WithMessage("Số tiền giảm phải lớn hơn 0");

            RuleFor(x => x.Request.EffectiveFrom)
                .NotEmpty()
                .WithMessage("Ngày bắt đầu không được để trống");

            RuleFor(x => x.Request.EffectiveTo)
                .GreaterThan(x => x.Request.EffectiveFrom)
                .When(x => x.Request.EffectiveTo.HasValue)
                .WithMessage("Ngày kết thúc phải sau ngày bắt đầu");

            // Rule: Global promotion phải do OEM tài trợ
            RuleFor(x => x.Request.FundedBy)
                .Equal(FundedBy.OEM)
                .When(x => x.Request.DealerId == null)
                .WithMessage("Global promotion phải do OEM tài trợ");

            // Note: Dealer-specific promotion có thể do OEM, Dealer, hoặc Shared tài trợ
            // OEM có thể targeted hỗ trợ cho dealer cụ thể

            // Rule: Global promotion không thể chỉ định branch
            RuleFor(x => x.Request.Scopes)
                .Must(scopes => scopes == null || !scopes.Any(s => s.BranchId != null))
                .When(x => x.Request.DealerId == null)
                .WithMessage("Global promotion không thể chỉ định branch cụ thể");

            // Rule: Scopes không được duplicate
            RuleForEach(x => x.Request.Scopes)
                .Must((cmd, scope, index) =>
                {
                    if (cmd.Request.Scopes == null) return true;
                    
                    var duplicates = cmd.Request.Scopes
                        .Where(s => s.ProductId == scope.ProductId && s.BranchId == scope.BranchId)
                        .Count();
                    
                    return duplicates <= 1;
                })
                .WithMessage("Không được có scope trùng lặp (cùng ProductId và BranchId)");
        }
    }
}

