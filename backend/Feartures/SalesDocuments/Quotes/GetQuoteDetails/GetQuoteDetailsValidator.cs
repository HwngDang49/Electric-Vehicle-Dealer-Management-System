using FluentValidation;

namespace backend.Feartures.SalesDocuments.Quotes.GetQuoteDetails
{
    public class GetQuoteDetailsValidator : AbstractValidator<GetQuoteByIdQuery>
    {
        public GetQuoteDetailsValidator()
        {
            RuleFor(x => x.QuoteId)
            .GreaterThan(0).WithMessage("Id must be greater than 0.");
            // DealerId lấy từ JWT, nhưng vẫn đảm bảo > 0
        }
    }
}
