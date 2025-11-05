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
                .NotEmpty().WithMessage("Mã Đại lí không được để trống")
                .MaximumLength(50).WithMessage("Mã Đại lí không được vượt quá 50 ký tự");

            RuleFor(x => x.Body.Name)
                .NotEmpty().WithMessage("Tên Đại lí không được để trống")
                .MaximumLength(255).WithMessage("Tên Đại lí không được vượt quá 255 ký tự");

            RuleFor(x => x.Body.LegalName)
            .NotEmpty().WithMessage("Tên pháp lý không được để trống")
            .MaximumLength(500).WithMessage("Tên pháp lý không được vượt quá 50 ký tự");


            RuleFor(x => x.Body.TaxId)
                .NotEmpty().WithMessage("Mã số thuế không được để trống")
                .MaximumLength(10).WithMessage("Mã số thuế không được vượt quá 10 ký tự");

            RuleFor(x => x.Body.CreditLimit)
                .NotEmpty().WithMessage("Credit limit không được để trống")
                .GreaterThanOrEqualTo(0).WithMessage("Credit limit không được là số âm");

        }
    }
}
