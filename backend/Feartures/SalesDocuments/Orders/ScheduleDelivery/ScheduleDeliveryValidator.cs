using FluentValidation;

namespace backend.Feartures.SalesDocuments.Orders.ScheduleDelivery
{
    public class ScheduleDeliveryValidator : AbstractValidator<ScheduleDeliveryRequest>
    {
        public ScheduleDeliveryValidator()
        {
            RuleFor(x => x.OrderId)
                .GreaterThan(0)
                .WithMessage("Order ID phải lớn hơn 0");

            RuleFor(x => x.DeliveryDate)
                .NotEmpty()
                .WithMessage("Ngày giao hàng không được để trống")
                .Must(BeValidDeliveryDate)
                .WithMessage("Ngày giao hàng không được trong quá khứ");

            RuleFor(x => x.DeliveryTimeSlot)
                .NotEmpty()
                .WithMessage("Khung giờ giao hàng không được để trống")
                .Must(BeValidTimeSlot)
                .WithMessage("Khung giờ giao hàng phải là: Morning, Afternoon, hoặc Evening");

            RuleFor(x => x.DeliveryAddress)
                .NotEmpty()
                .WithMessage("Địa chỉ giao hàng không được để trống")
                .MaximumLength(255)
                .WithMessage("Địa chỉ giao hàng không được vượt quá 255 ký tự");

            RuleFor(x => x.ContactPhone)
                .MaximumLength(20)
                .When(x => !string.IsNullOrEmpty(x.ContactPhone))
                .WithMessage("Số điện thoại liên hệ không được vượt quá 20 ký tự")
                .Matches(@"^[0-9+\-\s()]+$")
                .When(x => !string.IsNullOrEmpty(x.ContactPhone))
                .WithMessage("Số điện thoại liên hệ không hợp lệ");

            RuleFor(x => x.ContactName)
                .MaximumLength(255)
                .When(x => !string.IsNullOrEmpty(x.ContactName))
                .WithMessage("Tên người liên hệ không được vượt quá 255 ký tự");

            RuleFor(x => x.Notes)
                .MaximumLength(500)
                .When(x => !string.IsNullOrEmpty(x.Notes))
                .WithMessage("Ghi chú không được vượt quá 500 ký tự");
        }

        private static bool BeValidDeliveryDate(DateTime deliveryDate)
        {
            return deliveryDate.Date >= DateTime.Today;
        }

        private static bool BeValidTimeSlot(string timeSlot)
        {
            var validTimeSlots = new[] { "Morning", "Afternoon", "Evening" };
            return validTimeSlots.Contains(timeSlot, StringComparer.OrdinalIgnoreCase);
        }
    }
}
