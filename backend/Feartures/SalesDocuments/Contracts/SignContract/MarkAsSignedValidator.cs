using FluentValidation;

namespace backend.Feartures.SalesDocuments.Contracts.SignContract
{
    public sealed class MarkAsSignedValidator : AbstractValidator<MarkAsSignedCommand>
    {
        public MarkAsSignedValidator()
        {
            RuleFor(x => x.SalesDocId).GreaterThan(0);
        }
    }
}
