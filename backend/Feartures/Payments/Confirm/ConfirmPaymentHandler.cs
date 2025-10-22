using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Payments.Confirm
{
    public record ConfirmPaymentCommand(ConfirmPaymentRequest Request, long CurrentUserId) : IRequest<Result>;

    public class ConfirmPaymentHandler : IRequestHandler<ConfirmPaymentCommand, Result>
    {
        private readonly EVDmsDbContext _db;

        public ConfirmPaymentHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result> Handle(ConfirmPaymentCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // Lấy payment với invoice và dealer
            var payment = await _db.Payments
                .Include(p => p.Invoice)
                    .ThenInclude(i => i.Dealer)
                .FirstOrDefaultAsync(p => p.PaymentId == req.PaymentId, ct);

            if (payment == null)
                return Result.NotFound($"Payment {req.PaymentId} not found");

            // Chỉ confirm payment đang Pending
            if (payment.Status != PaymentStatus.Pending.ToString())
                return Result.Error($"Can only confirm payment with status 'Pending'. Current status: {payment.Status}");

            // phải có invoice
            var invoice = payment.Invoice;
            if (invoice == null)
                return Result.Error("Invoice not found for this payment");

            // Invoice phải đang Pending
            if (invoice.Status != InvoiceStatus.Pending.ToString())
                return Result.Error($"Invoice status must be 'Pending' to confirm payment. Current: {invoice.Status}");

            // phải có dealer
            var dealer = invoice.Dealer;
            if (dealer == null)
                return Result.Error($"Dealer {invoice.DealerId} not found");

            // Update payment status
            payment.Status = PaymentStatus.Captured.ToString();
            payment.PaidAt = DateTime.UtcNow; // Set thời gian nhận tiền
            payment.Note = req.Note;

            // Update invoice status
            invoice.Status = InvoiceStatus.Paid.ToString();

            // Trừ CreditUsed của dealer
            dealer.CreditUsed -= payment.Amount;
            if (dealer.CreditUsed < 0)
                dealer.CreditUsed = 0; 

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}

