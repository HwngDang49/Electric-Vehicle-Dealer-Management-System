using FluentValidation;
namespace backend.Feartures.Dealers.Create
{
    public class CreateDealerValidator : AbstractValidator<CreateDealerCommand>
    {
        public CreateDealerValidator()
        {
            RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã Đại lí không được để trống")
            .MaximumLength(50).WithMessage("Mã Đại lí không được vượt quá 50 ký tự");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên Đại lí không được để trống")
                .MaximumLength(255).WithMessage("Tên Đại lí không được vượt quá 255 ký tự");

            RuleFor(x => x.LegalName)
            .NotEmpty().WithMessage("Tên pháp lý không được để trống")
            .MaximumLength(500).WithMessage("Tên pháp lý không được vượt quá 50 ký tự");


            RuleFor(x => x.TaxId)
                .NotEmpty().WithMessage("Mã số thuế không được để trống")
                .MaximumLength(10).WithMessage("Mã số thuế không được vượt quá 10 ký tự");

            RuleFor(x => x.CreditLimit)
                .GreaterThanOrEqualTo(0).WithMessage("Credit limit không được là số âm");

            //status 400 -> nếu validation fails
        }
    }
}
