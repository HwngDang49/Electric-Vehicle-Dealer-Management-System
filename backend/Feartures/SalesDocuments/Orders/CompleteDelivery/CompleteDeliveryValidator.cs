using FluentValidation;

namespace backend.Feartures.SalesDocuments.Orders.CompleteDelivery
{
    public class CompleteDeliveryValidator : AbstractValidator<CompleteDeliveryRequest>
    {
        public CompleteDeliveryValidator()
        {
            RuleFor(x => x.OrderId)
                .GreaterThan(0)
                .WithMessage("Order ID must be > 0");

            RuleFor(x => x.DeliveryDocUrl)
                .MaximumLength(500)
                .When(x => !string.IsNullOrEmpty(x.DeliveryDocUrl))
                .WithMessage("URL docs must be less than 500 keywords")
                .Must(BeValidUrl)
                .When(x => !string.IsNullOrEmpty(x.DeliveryDocUrl))
                .WithMessage("URL doc invalid");

            RuleFor(x => x.Notes)
                .MaximumLength(1000)
                .When(x => !string.IsNullOrEmpty(x.Notes))
                .WithMessage("Note can not over 1000 words");

            RuleFor(x => x.ActualDeliveryTime)
                .Must(BeValidDeliveryTime)
                .When(x => x.ActualDeliveryTime.HasValue)
                .WithMessage("Can not be less than now");
        }

        private static bool BeValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url))
                return true;

            return Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
                   (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
        }

        private static bool BeValidDeliveryTime(DateTime? deliveryTime)
        {
            if (!deliveryTime.HasValue)
                return true;

            var now = DateTime.UtcNow;
            var oneDayFromNow = now.AddDays(1);

            // Thời gian giao hàng không được trong tương lai xa (quá 1 ngày)
            return deliveryTime.Value <= oneDayFromNow;
        }
    }
}
