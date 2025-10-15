using backend.Infrastructure.Data;
using FluentValidation;

namespace backend.Feartures.PurchaseOrders.Create
{
    public class CreatePoValidator : AbstractValidator<CreatePoRequest>
    {
        public CreatePoValidator()
        {
            //RuleFor(d => d.DealerId)
            //    .MustAsync(async (id, ct) => await )

        }
    }
}
