using FluentValidation;

namespace backend.Feartures.SalesDocuments.Deposits.AddDeposit
{
    public sealed class AddDepositValidator : AbstractValidator<AddDepositCommand>
    {
        public AddDepositValidator()
        {
            RuleFor(x => x.OrderId).GreaterThan(0);
            RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Deposit amount must be greater than zero.");

            // **ĐÃ LOẠI BỎ RuleFor cho PaidAt ở đây**
        }
    }
}


