using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Deposits.AddDeposit
{
    public sealed class AddDepositHandler : IRequestHandler<AddDepositCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;
        public AddDepositHandler(EVDmsDbContext db) => _db = db;

        public async Task<Result<long>> Handle(AddDepositCommand request, CancellationToken ct)
        {
        var order = await _db.Orders.FirstOrDefaultAsync(o =>
            o.OrderId == request.OrderId &&
            o.DealerId == request.DealerId, ct);

        if (order is null)
            return Result.NotFound($"Order #{request.OrderId} not found.");

        // Kiểm tra contract đã được tạo chưa
        var contract = await _db.Contracts
            .FirstOrDefaultAsync(c => c.OrderId == request.OrderId, ct);

        if (contract == null)
            return Result.Error("Contract must be created before adding deposit.");

        // 1. Tính tổng số tiền đã cọc và số tiền sắp cọc
        decimal totalDepositAfterThisPayment = order.DepositAmount + request.Amount;

        // 2. So sánh với số tiền cọc yêu cầu (10% của tổng giá trị đơn hàng)
        var requiredDepositAmount = order.TotalAmount * 0.1m;
        
        // Kiểm tra không vượt quá tổng giá trị đơn hàng
        if (totalDepositAfterThisPayment > order.TotalAmount)
            return Result.Error($"Total deposit amount cannot exceed order total amount: {order.TotalAmount:C}");

            order.DepositAmount = totalDepositAfterThisPayment;

            // Dùng thời gian của server để cập nhật
            order.UpdatedAt = DateTimeHelper.UtcNow();

            await _db.SaveChangesAsync(ct);

            return Result.Success(order.OrderId);
        }
    }
}
