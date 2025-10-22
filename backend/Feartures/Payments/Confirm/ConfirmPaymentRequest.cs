using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Payments.Confirm
{
    public class ConfirmPaymentRequest : IRequest<Result>
    {
        public long PaymentId { get; set; }
        public string? Note { get; set; } // Ghi chú khi confirm (optional)
    }
}

