using FluentValidation;

namespace backend.Feartures.SalesDocuments.Quotes.GetQuotes
{
    public sealed class GetQuotesValidator : AbstractValidator<GetQuotesQuery>
    {
        public GetQuotesValidator()
        {
            RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
            RuleFor(x => x.Status).Must(s => new[] { "Draft", "Finalized", "Confirmed", "Expired" }.Contains(s)).When(x => !string.IsNullOrWhiteSpace(x.Status));
        }
    }
}
