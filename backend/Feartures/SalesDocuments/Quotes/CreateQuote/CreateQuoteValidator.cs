using FluentValidation;

namespace backend.Feartures.SalesDocuments.Quotes.CreateQuote
{
    //sealed : không thể kế thừa
    public sealed class CreateQuoteValidator : AbstractValidator<CreateQuoteCommand>
    {
        public CreateQuoteValidator()
        {
            // DealerId được set trong controller từ JWT
            RuleFor(x => x.CustomerId).GreaterThan(0);

            // Items có thể rỗng (quote trống). Nếu có thì validate từng dòng.
            RuleForEach(x => x.Items).ChildRules(item =>
            {
                item.RuleFor(i => i.ProductId).GreaterThan(0);
                item.RuleFor(i => i.Qty).GreaterThan(0);
                item.RuleFor(i => i.UnitPrice).GreaterThanOrEqualTo(0);
                item.RuleFor(i => i.LineDiscount).GreaterThanOrEqualTo(0);
                item.RuleFor(i => i.LinePromo).GreaterThanOrEqualTo(0);
            });
        }
    }
}
