using FluentValidation;

namespace backend.Feartures.Dealers.Update
{
    //AbstractValidator<T> là một lớp cơ sở trong thư viện FluentValidation được sử dụng để tạo các trình xác thực (validators) cho các kiểu dữ liệu cụ thể.
    // Khi bạn kế thừa từ AbstractValidator<T>, bạn có thể định nghĩa các quy tắc xác thực cho các thuộc tính của kiểu dữ liệu T.
    public class UpdateDealerValidator : AbstractValidator<UpdateDealerCommand>
    {
        public UpdateDealerValidator()
        {
            RuleFor(x => x.DealerId).GreaterThan(0);

            RuleFor(x => x.Body.Code)
                .MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.Body.Code));

            RuleFor(x => x.Body.Name)
                .MaximumLength(255).When(x => !string.IsNullOrWhiteSpace(x.Body.Name));

            RuleFor(x => x.Body.LegalName)
                .MaximumLength(500).When(x => !string.IsNullOrWhiteSpace(x.Body.LegalName));

            RuleFor(x => x.Body.TaxId)
                .MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.Body.TaxId));

            RuleFor(x => x.Body.CreditLimit)
                .GreaterThanOrEqualTo(0).When(x => x.Body.CreditLimit.HasValue);
        }
    }
}
