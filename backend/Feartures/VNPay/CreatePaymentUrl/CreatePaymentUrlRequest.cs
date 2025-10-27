using Ardalis.Result;
using MediatR;

namespace backend.Feartures.VNPay.CreatePaymentUrl;

public record CreatePaymentUrlRequest(long InvoiceId) : IRequest<Result<CreatePaymentUrlResponse>>;

