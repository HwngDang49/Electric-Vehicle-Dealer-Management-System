using FluentValidation;

namespace backend.Feartures.Customers.GetListCustomer
{
    public class GetListCustomerValidator : AbstractValidator<GetCustomersQuery>
    {
        public GetListCustomerValidator()
        {

            // Page và PageSize phải là số dương
            RuleFor(query => query.Page)
                .GreaterThanOrEqualTo(1).WithMessage("Page number must be at least 1.");

            RuleFor(query => query.PageSize)
                .GreaterThan(0).WithMessage("Page size must be greater than 0.");
        }
    }
}
