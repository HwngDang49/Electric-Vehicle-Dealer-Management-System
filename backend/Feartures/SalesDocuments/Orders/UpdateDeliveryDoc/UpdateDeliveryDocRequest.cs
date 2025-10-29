using FluentValidation;

namespace backend.Feartures.SalesDocuments.Orders.UpdateDeliveryDoc
{
    public class UpdateDeliveryDocRequest
    {
        public long OrderId { get; set; }
        public string? DeliveryDocUrl { get; set; }
    }

    public class UpdateDeliveryDocValidator : AbstractValidator<UpdateDeliveryDocRequest>
    {
        public UpdateDeliveryDocValidator()
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
        }

        private static bool BeValidUrl(string? url)
        {
            if (string.IsNullOrEmpty(url))
                return true;

            return Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
                   (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
        }
    }
}
