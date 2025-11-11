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
                        || p.Status == PaymentStatus.Captured.ToString()))
                .FirstOrDefaultAsync(ct);

            if (existingPayment != null)
                return Result.Error("Invoice already has an active payment");

            // Kiểm tra wallet_balance đủ tiền nếu là B2B Invoice (PO payment)
            if (invoice.InvoiceType == "B2B" && invoice.Dealer != null)
            {
                if (invoice.Dealer.WalletBalance < invoice.Amount)
                {
                    return Result.Error($"Insufficient wallet balance. Current: {invoice.Dealer.WalletBalance:n0}, Required: {invoice.Amount:n0}. Please ensure wallet has sufficient funds before creating payment.");
                }
            }

            // Validate invoice amount > 0
            if (invoice.Amount <= 0)
            {
                return Result.Error("Invoice amount must be greater than 0");
            }

            // Tạo payment với status Pending - chờ Manufacturer xác nhận
            // Payment amount phải bằng invoice amount (không cho phép partial payment cho B2B)
            var payment = new Payment
            {
                InvoiceId = req.InvoiceId,
                Amount = invoice.Amount, // Luôn dùng invoice.Amount để đảm bảo consistency
                Status = PaymentStatus.Pending.ToString(), // Pending ddang chowf xuwr lys
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

