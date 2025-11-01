using Ardalis.Result;
using MediatR;

namespace backend.Feartures.VNPay.CreateSettlementPaymentUrl
{
    public class CreateSettlementPaymentUrlRequest : IRequest<Result<CreateSettlementPaymentUrlResponse>>
    {
        public long ClaimId { get; set; }
        public decimal PaidAmount { get; set; }
    }
    
    public record CreateSettlementPaymentUrlResponse(string PaymentUrl);
}

