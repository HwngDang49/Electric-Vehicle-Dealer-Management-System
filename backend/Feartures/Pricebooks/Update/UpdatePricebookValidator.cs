using FluentValidation;

namespace backend.Feartures.Pricebooks.Update
{
    /// <summary>
    /// Validator cho UpdatePricebookStatusCommand (quick status change)
    /// </summary>
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


