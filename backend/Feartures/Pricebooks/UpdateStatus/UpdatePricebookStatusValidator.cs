using FluentValidation;
using backend.Domain.Enums;

namespace backend.Feartures.Pricebooks.UpdateStatus
{
    public sealed class UpdatePricebookStatusValidator : AbstractValidator<UpdatePricebookStatusCommand>
    {
        public UpdatePricebookStatusValidator()
        {
            RuleFor(x => x.PricebookId).GreaterThan(0).WithMessage("Pricebook ID must be greater than 0.");
            RuleFor(x => x.Status)
                .IsInEnum()
                .WithMessage("Invalid Pricebook Status.");
        }
    }
}
