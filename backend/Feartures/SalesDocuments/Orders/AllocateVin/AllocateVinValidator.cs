using FluentValidation;

namespace backend.Feartures.SalesDocuments.Orders.AllocateVin
{
    public class AllocateVinToRoValidator : AbstractValidator<AllocateVinToRoRequest>
    {
        public AllocateVinToRoValidator()
        {
            RuleFor(x => x.OrderId)
                .GreaterThan(0)
                .WithMessage("Order ID phải lớn hơn 0");

            RuleFor(x => x.VinCode)
                .NotEmpty()
                .WithMessage("VIN Code không được để trống")
                .MaximumLength(30)
                .WithMessage("VIN Code không được vượt quá 30 ký tự")
                .Matches(@"^[A-HJ-NPR-Z0-9]{17}$")
                .WithMessage("VIN Code phải có đúng 17 ký tự và không chứa I, O, Q");

            RuleFor(x => x.OrderLineId)
                .GreaterThan(0)
                .When(x => x.OrderLineId.HasValue)
                .WithMessage("Order Line ID phải lớn hơn 0 nếu được chỉ định");

            RuleFor(x => x.Note)
                .MaximumLength(500)
                .When(x => !string.IsNullOrEmpty(x.Note))
                .WithMessage("Ghi chú không được vượt quá 500 ký tự");
        }
    }
}
