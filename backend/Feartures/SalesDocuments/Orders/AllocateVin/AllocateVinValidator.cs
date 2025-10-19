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

            RuleFor(x => x.Note)
                .MaximumLength(500)
                .When(x => !string.IsNullOrEmpty(x.Note))
                .WithMessage("Ghi chú không được vượt quá 500 ký tự");
        }
    }
}
