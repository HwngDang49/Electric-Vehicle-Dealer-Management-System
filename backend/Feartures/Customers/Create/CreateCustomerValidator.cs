using backend.Common.Validation;
using FluentValidation;

namespace backend.Feartures.Customers.Create
{
    public sealed class CreateCustomerValidator : AbstractValidator<CreateCustomerCommand>
    {
        public CreateCustomerValidator()
        {
            RuleFor(x => x.FullName).NotEmpty().MaximumLength(255);

            // Email là bắt buộc khi tạo customer mới
            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .EmailAddress()
                .WithMessage("Email format is invalid.");

            RuleFor(x => x.Phone).MaximumLength(30);
            RuleFor(x => x.Phone)
                .MustBeVietnamesePhoneNumber()
                .When(x => !string.IsNullOrWhiteSpace(x.Phone));
        }
    }
}
