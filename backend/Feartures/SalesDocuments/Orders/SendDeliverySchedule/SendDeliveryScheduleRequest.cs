using FluentValidation;

namespace backend.Feartures.SalesDocuments.Orders.SendDeliverySchedule
{
    public class SendDeliveryScheduleRequest
    {
        public long OrderId { get; set; }
    }

    public class SendDeliveryScheduleRequestValidator : AbstractValidator<SendDeliveryScheduleRequest>
    {
        public SendDeliveryScheduleRequestValidator()
        {
            RuleFor(x => x.OrderId)
                .GreaterThan(0)
                .WithMessage("OrderId must be greater than 0");
        }
    }
}

