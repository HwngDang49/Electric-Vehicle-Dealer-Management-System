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

            // Kiểm tra invoice status - không cho thanh toán nếu đã Paid
            if (invoice.Status == InvoiceStatus.Paid.ToString())
                return Result.Error("Invoice already paid");

            // Kiểm tra nếu đã có payment Processing hoặc Paid rồi thì không cho tạo nữa
            var existingPayment = await _db.Payments
                .Where(p => p.InvoiceId == req.InvoiceId
                    && (p.Status == PaymentStatus.Processing.ToString()
                        || p.Status == PaymentStatus.Paid.ToString()))
                .FirstOrDefaultAsync(ct);

            if (existingPayment != null)
                return Result.Error("Invoice already has an active payment");

            // Tạo payment với status Pending - chờ Manufacturer xác nhận
            var payment = new Payment
            {
                InvoiceId = req.InvoiceId,
                Amount = invoice.Amount,
                Status = PaymentStatus.Pending.ToString(), // Pending - đang xử lý
                Method = req.Method,
                PaidAt = null, // Chưa nhận tiền
                ReferenceNo = req.ReferenceNo,
                Note = req.Note,
                CreatedBy = cmd.CurrentUserId
            };

            _db.Payments.Add(payment);

            // Cập nhật Invoice status sang Processing khi tạo payment
            invoice.Status = InvoiceStatus.Processing.ToString();

            await _db.SaveChangesAsync(ct);

            return Result.Success(payment.PaymentId);
        }
    }
}

