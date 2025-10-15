using FluentValidation;

namespace backend.Feartures.SalesDocuments.Orders.ConfirmOrders
{
    public class ConfirmOrderValidator : AbstractValidator<ConfirmOrderCommand>
    {
        public ConfirmOrderValidator()
        {
            RuleFor(x => x.SalesDocId).GreaterThan(0).WithMessage("SalesDocId must be greater than 0.");
            RuleFor(x => x.DealerId).GreaterThan(0).WithMessage("DealerId must be greater than 0.");
        }
    }
}
