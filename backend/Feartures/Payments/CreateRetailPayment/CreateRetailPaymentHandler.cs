using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Payments.CreateRetailPayment
{
    public record CreateRetailPaymentCommand(CreateRetailPaymentRequest Request, long CurrentUserId, long? BranchId) : IRequest<Result<long>>;
    public class CreateRetailPaymentHandler : IRequestHandler<CreateRetailPaymentCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;
        public CreateRetailPaymentHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<long>> Handle(CreateRetailPaymentCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;
            // Include Dealer để có thể cập nhật WalletBalance
            var invoice = await _db.Invoices
                .Include(x => x.Payments)
                .Include(x => x.Dealer)
                .FirstOrDefaultAsync(i => i.InvoiceId == req.InvoiceId, ct);
            if (invoice == null)
                return Result.NotFound($"Invoice {req.InvoiceId} not found");
            if (invoice.InvoiceType != InvoiceType.Retail.ToString())
                return Result.Invalid(new ValidationError { ErrorMessage = "Only retail invoices are supported" });
            
            // Validate BranchId nếu user có branch
            if (cmd.BranchId.HasValue && invoice.BranchId != cmd.BranchId.Value)
            {
                return Result.Forbidden("You don't have permission to create payment for this invoice.");
            }

            // Lấy order & deposit
            var order = await _db.Orders.FirstOrDefaultAsync(o => o.OrderId == invoice.SalesDocId, ct);
            var deposit = order?.DepositAmount ?? 0;

            var paidAmount = invoice.Payments.Where(p => p.Status == RetailPaymentStatus.Captured.ToString() || p.Status == "Paid").Sum(p => p.Amount);
            var outstandingAmount = invoice.Amount - deposit - paidAmount;
            
            if (outstandingAmount < 0) outstandingAmount = 0;

            if (req.Amount != outstandingAmount)
                return Result.Invalid(new ValidationError { ErrorMessage = $"Số tiền thanh toán phải bằng tổng giá trị trừ tiền cọc và trừ tất cả các khoản đã thanh toán (còn lại: {outstandingAmount:N0})" });

            var payment = new Payment
            {
                InvoiceId = req.InvoiceId,
                Amount = req.Amount,
                Status = RetailPaymentStatus.Captured.ToString(),
                Method = "Cash",
                PaidAt = System.DateTime.UtcNow,
                ReferenceNo = null,
                Note = null,
                CreatedBy = cmd.CurrentUserId,
            };

            _db.Payments.Add(payment);

            // Nếu đã đủ tiền, chuyển hóa đơn sang Paid
            paidAmount += req.Amount;
            if (invoice.Amount - deposit <= paidAmount)
            {
                invoice.Status = InvoiceStatus.Paid.ToString();
            }

            // Cộng số tiền thanh toán còn lại vào wallet_balance của dealer
            if (invoice.Dealer != null)
            {
                invoice.Dealer.WalletBalance += req.Amount;
            }

            await _db.SaveChangesAsync(ct);
            return Result.Success(payment.PaymentId);
        }
    }
}
