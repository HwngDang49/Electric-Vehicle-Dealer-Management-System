using backend.Domain.Enums;
using FluentValidation;

namespace backend.Feartures.Promotions.Update
{
    public class UpdatePromotionValidator : AbstractValidator<UpdatePromotionCommand>
    {
        public UpdatePromotionValidator()
        {
            RuleFor(x => x.Request.Name)
                .NotEmpty().WithMessage("Tên promotion không được để trống")
                .MaximumLength(255).WithMessage("Tên promotion không được vượt quá 255 ký tự");

            RuleFor(x => x.Request.Description)
                .MaximumLength(1000).WithMessage("Mô tả không được vượt quá 1000 ký tự");

            RuleFor(x => x.Request.AmountOff)
                .GreaterThan(0).WithMessage("Số tiền giảm phải lớn hơn 0");

            RuleFor(x => x.Request.EffectiveFrom)
                .NotEmpty().WithMessage("Ngày bắt đầu không được để trống");

            RuleFor(x => x.Request)
                .Must(req => !req.EffectiveTo.HasValue || req.EffectiveFrom < req.EffectiveTo.Value)
                .WithMessage("Ngày kết thúc phải sau ngày bắt đầu");

            // Business Rule: Global promotion phải OEM funded
            RuleFor(x => x.Request)
                .Must(req => req.DealerId.HasValue || req.FundedBy == FundedBy.OEM)
                .WithMessage("Global promotion phải do OEM tài trợ");
        }
    }
}

