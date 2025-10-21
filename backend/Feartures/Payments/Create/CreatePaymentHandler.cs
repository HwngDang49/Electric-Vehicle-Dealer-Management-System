using Ardalis.Result;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Payments.Create
{
    public record CreatePaymentCommand(CreatePaymentRequest Request, long CurrentUserId) : IRequest<Result<long>>;

    public class CreatePaymentHandler : IRequestHandler<CreatePaymentCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;

        public CreatePaymentHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<long>> Handle(CreatePaymentCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // Kiểm tra invoice tồn tại
            var invoice = await _db.Invoices
                .Include(i => i.Dealer)
                .FirstOrDefaultAsync(i => i.InvoiceId == req.InvoiceId, ct);

            if (invoice == null)
                return Result.NotFound($"Invoice {req.InvoiceId} not found");

            // Kiểm tra invoice status - chỉ cho trả 1 lần
            if (invoice.Status == InvoiceStatus.Paid.ToString())
                return Result.Error("Invoice already paid");

            // Kiểm tra số tiền thanh toán - phải trả đủ
            if (req.Amount != invoice.Amount)
                return Result.Error($"Payment amount {req.Amount:n0} must equal invoice amount {invoice.Amount:n0}");

            // Tạo payment
            var payment = new Payment
            {
                InvoiceId = req.InvoiceId,
                Amount = req.Amount,
                Status = PaymentStatus.Captured.ToString(),
                Method = req.Method,
                PaidAt = DateTime.UtcNow,
                ReferenceNo = req.ReferenceNo,
                Note = req.Note,
                CreatedBy = cmd.CurrentUserId
            };

            _db.Payments.Add(payment);

            // Trừ CreditUsed của dealer
            var dealer = invoice.Dealer;
            if (dealer == null)
                return Result.Error($"Dealer {invoice.DealerId} not found");

            dealer.CreditUsed -= req.Amount;
            if (dealer.CreditUsed < 0)
                dealer.CreditUsed = 0; // Đảm bảo không âm

            // Cập nhật invoice status - trả 1 lần nên chắc chắn là Paid
            invoice.Status = InvoiceStatus.Paid.ToString();

            await _db.SaveChangesAsync(ct);

            return Result.Success(payment.PaymentId);
        }
    }
}

