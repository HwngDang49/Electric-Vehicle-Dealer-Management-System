using FluentValidation;

namespace backend.Feartures.SalesDocuments.Contracts.CreateContract
{
    public sealed class CreateContractValidator : AbstractValidator<CreateContractCommand>
    {
        public CreateContractValidator()
        {
            RuleFor(x => x.SalesDocId).GreaterThan(0);

            RuleFor(x => x.ContractFileUrl)
                .MaximumLength(2048)
                .When(x => !string.IsNullOrWhiteSpace(x.ContractFileUrl));
        }
    }
}
