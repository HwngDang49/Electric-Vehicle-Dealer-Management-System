using FluentValidation;

namespace backend.Feartures.Dealers.GetDealer
{
    public class GetDealerByIdValidator : AbstractValidator<GetDealerByIdQuery>
    {
        public GetDealerByIdValidator()
        {
            RuleFor(x => x.DealerId).GreaterThan(0).WithMessage("DealerId must be greater than 0.");
        }
    }
}
