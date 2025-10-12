using FluentValidation;

namespace backend.Feartures.Customers.GetCustomerDetails
{
    /// <summary>
    /// Validator cho GetCustomerByIdQuery.
    /// </summary>
    public class GetCustomerByIdValidator : AbstractValidator<GetCustomerByIdQuery>
    {
        public GetCustomerByIdValidator()
        {
            // Quy tắc: Id phải lớn hơn 0.
            RuleFor(query => query.Id)
                .GreaterThan(0)
                .WithMessage("Customer ID must be a positive number.");
        }
    }
}
