using FluentValidation;

namespace backend.Feartures.Dealers.GetList
{
    public class GetDealersValidator : AbstractValidator<GetDealersQuery>
    {
        public GetDealersValidator()
        {
            // Page và PageSize phải là số dương
            RuleFor(query => query.Page)
                .GreaterThanOrEqualTo(1).WithMessage("Page number must be at least 1.");

            RuleFor(query => query.PageSize)
                .GreaterThan(0).WithMessage("Page size must be greater than 0.");
        }
    }
}

