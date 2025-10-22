using FluentValidation;

namespace backend.Feartures.Pricebooks.Update
{
    public class UpdatePricebookNameValidator : AbstractValidator<UpdatePricebookNameCommand>
    {
        public UpdatePricebookNameValidator()
        {
            RuleFor(x => x.PricebookId)
                .GreaterThan(0)
                .WithMessage("Pricebook ID phải lớn hơn 0");

            RuleFor(x => x.Request.Name)
                .NotEmpty()
                .WithMessage("Tên bảng giá không được để trống")
                .MaximumLength(255)
                .WithMessage("Tên bảng giá không được vượt quá 255 ký tự");
        }
    }

    public class UpdatePricebookStatusValidator : AbstractValidator<UpdatePricebookStatusCommand>
    {
        public UpdatePricebookStatusValidator()
        {
            RuleFor(x => x.PricebookId)
                .GreaterThan(0)
                .WithMessage("Pricebook ID phải lớn hơn 0");

            RuleFor(x => x.Request.Status)
                .IsInEnum()
                .WithMessage("Trạng thái bảng giá không hợp lệ");
        }
    }
}


