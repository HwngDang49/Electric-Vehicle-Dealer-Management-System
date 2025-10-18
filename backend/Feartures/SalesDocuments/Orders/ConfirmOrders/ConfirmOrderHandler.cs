using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.ConfirmOrders
{
    public sealed class ConfirmOrderHandler : IRequestHandler<ConfirmOrderCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        public ConfirmOrderHandler(EVDmsDbContext db) => _db = db;

        public async Task<Result> Handle(ConfirmOrderCommand request, CancellationToken ct)
        {
        var order = await _db.Orders.FirstOrDefaultAsync(o =>
            o.OrderId == request.OrderId &&
            o.DealerId == request.DealerId, ct);

        if (order is null)
            return Result.NotFound($"Order #{request.OrderId} not found.");

            // Guard 1: Trạng thái hiện tại phải là "Draft"
            if (order.Status != OrderStatus.Draft.ToString())
                return Result.Error($"Only orders with 'Draft' status can be confirmed. Current status: '{order.Status}'.");

        // Guard 2: Kiểm tra Hợp đồng
        var contract = await _db.Contracts
            .FirstOrDefaultAsync(c => c.OrderId == request.OrderId, ct);

        if (contract == null)
            return Result.Error("Order must have a contract before confirmation.");

        if (string.IsNullOrEmpty(contract.ContractNo))
            return Result.Error("Contract number is required.");

        if (!contract.SignedAt.HasValue)
            return Result.Error("Contract must be signed before order confirmation.");

        // Guard 3: Kiểm tra Tiền cọc
        var requiredDepositAmount = order.TotalAmount * 0.1m; // 10% của tổng giá trị đơn hàng
        if (order.DepositAmount < requiredDepositAmount)
            return Result.Error($"Minimum deposit amount required: {requiredDepositAmount:C}. Current deposit: {order.DepositAmount:C}");

            // Nếu tất cả điều kiện đều đạt, chuyển trạng thái
            order.Status = OrderStatus.Confirmed.ToString();
            order.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}
