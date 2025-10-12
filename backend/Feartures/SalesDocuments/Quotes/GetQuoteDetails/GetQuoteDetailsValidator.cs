using FluentValidation;

namespace backend.Feartures.SalesDocuments.Quotes.GetQuoteDetails
{
    public class GetQuoteDetailsValidator : AbstractValidator<GetQuoteByIdQuery>
    {
        public GetQuoteDetailsValidator()
        {
            RuleFor(x => x.SalesDocId)
            .GreaterThan(0).WithMessage("Id must be greater than 0.");
            // DealerId lấy từ JWT, nhưng vẫn đảm bảo > 0
            RuleFor(x => x.DealerId)
                .GreaterThan(0).WithMessage("Dealer context is required.");
        }
    }
}
