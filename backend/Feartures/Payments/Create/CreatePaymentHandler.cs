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

            //// Kiểm tra số tiền thanh toán - phải trả đủ
            //if (req.Amount != invoice.Amount)
            //    return Result.Error($"Payment amount {req.Amount:n0} must equal invoice amount {invoice.Amount:n0}");

            // Tạo payment với status Pending - chờ Manufacturer xác nhận
            var payment = new Payment
            {
                InvoiceId = req.InvoiceId,
                Amount = invoice.Amount,
                Status = PaymentStatus.Pending.ToString(), // Pending, chờ confirm
                Method = req.Method,
                PaidAt = null, // Chưa nhận tiền
                ReferenceNo = req.ReferenceNo,
                Note = req.Note,
                CreatedBy = cmd.CurrentUserId
            };

            _db.Payments.Add(payment);


            await _db.SaveChangesAsync(ct);

            return Result.Success(payment.PaymentId);
        }
    }
}

