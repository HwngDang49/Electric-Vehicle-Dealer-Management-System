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
            var order = await _db.SalesDocuments.FirstOrDefaultAsync(sd =>
                sd.SalesDocId == request.SalesDocId &&
                sd.DealerId == request.DealerId &&
                sd.DocType == DocTypeEnum.Order.ToString(), ct);

            if (order is null)
                return Result.NotFound($"Order #{request.SalesDocId} not found.");

            // Guard 1: Trạng thái hiện tại phải là "Draft"
            if (order.Status != OrderStatus.Draft.ToString())
                return Result.Error($"Only orders with 'Draft' status can be confirmed. Current status: '{order.Status}'.");

            // Guard 2: Kiểm tra Hợp đồng
            if (string.IsNullOrWhiteSpace(order.ContractNo))
                return Result.Error("A contract number is required before confirming.");

            // Guard 3: Kiểm tra Chữ ký
            if (!order.SignedAt.HasValue)
                return Result.Error("The contract must be signed before confirming.");

            // Guard 4: Kiểm tra Tiền cọc
            if (order.DepositAmount < order.RequiredDepositAmount)
            {
                var remaining = (order.RequiredDepositAmount ?? 0) - order.DepositAmount;
                return Result.Error($"Deposit is insufficient. Remaining amount: {remaining:N0} VND.");
            }

            // Nếu tất cả điều kiện đều đạt, chuyển trạng thái
            order.Status = OrderStatus.Confirmed.ToString();
            order.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}
