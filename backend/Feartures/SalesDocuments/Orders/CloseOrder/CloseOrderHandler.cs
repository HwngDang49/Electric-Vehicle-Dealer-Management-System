using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Orders.CloseOrder
{
    public record CloseOrderCommand(CloseOrderRequest Request, long CurrentUserId) : IRequest<Result>;
    public class CloseOrderHandler : IRequestHandler<CloseOrderCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        public CloseOrderHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result> Handle(CloseOrderCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;
            var order = await _db.Orders
                .Include(o => o.Invoices)
                .ThenInclude(i => i.Payments)
                .FirstOrDefaultAsync(o => o.OrderId == req.OrderId, ct);
            if (order == null)
                return Result.NotFound($"Order {req.OrderId} not found");

            var totalInvoiceAmount = order.Invoices.Sum(inv => inv.Amount);
            var totalPaid = order.Invoices
                .SelectMany(inv => inv.Payments)
                .Where(p => p.Status == "Captured" || p.Status == "Paid")
                .Sum(p => p.Amount);

            var deposit = order.DepositAmount;
            var required = totalInvoiceAmount - deposit;
            if (required < 0) required = 0;

            if (totalPaid < required)
            {
                var validationError = new ValidationError
                {
                    Identifier = "PaymentValidation",
                    ErrorMessage = "Chưa thanh toán đủ tổng tiền sau khi trừ đặt cọc."
                };
                return Result.Invalid(validationError);
            }

            order.Status = OrderStatus.Closed.ToString();

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
    }
}
