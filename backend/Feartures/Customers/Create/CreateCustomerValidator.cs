using backend.Common.Validation;
using FluentValidation;

namespace backend.Feartures.Customers.Create
{
    public class CreateCustomerValidator : AbstractValidator<CreateCustomerRequest>
    {
        public CreateCustomerValidator()
        {
            RuleFor(x => x.DealerId).GreaterThan(0);
            RuleFor(x => x.FullName).NotEmpty().MaximumLength(255);

            // Bắt buộc phải có ít nhất 1 trong 2
            RuleFor(x => x).Must(x =>
                !string.IsNullOrWhiteSpace(x.Phone) ||
                !string.IsNullOrWhiteSpace(x.Email))
                .WithMessage("Either phone or email is required.");

            RuleFor(x => x.Phone).MaximumLength(30);
            RuleFor(x => x.Email)
                .EmailAddress()
                .When(x => !string.IsNullOrWhiteSpace(x.Email));

            RuleFor(x => x.Phone)
                .MustBeVietnamesePhoneNumber()
                .When(x => !string.IsNullOrWhiteSpace(x.Phone));

        }
    }
}
