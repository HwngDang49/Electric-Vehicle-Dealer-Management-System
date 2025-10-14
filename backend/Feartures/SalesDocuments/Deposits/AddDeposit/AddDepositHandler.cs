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
            var order = await _db.SalesDocuments.FirstOrDefaultAsync(sd =>
                sd.SalesDocId == request.SalesDocId &&
                sd.DealerId == request.DealerId &&
                sd.DocType == DocTypeEnum.Order.ToString(), ct);

            if (order is null)
                return Result.NotFound($"Order #{request.SalesDocId} not found.");

            if (string.IsNullOrWhiteSpace(order.ContractNo) || !order.SignedAt.HasValue)
                return Result.Error("A signed contract is required before adding a deposit.");

            // 1. Kiểm tra xem đơn hàng có yêu cầu cọc không
            if (!order.RequiredDepositAmount.HasValue || order.RequiredDepositAmount <= 0)
            {
                // Nếu không yêu cầu cọc, có thể cho phép ghi nhận thanh toán thường
                // hoặc báo lỗi tùy theo nghiệp vụ. Ở đây ta giả sử phải có cọc.
                return Result.Error("This order does not have a required deposit amount set.");
            }

            // 2. Tính tổng số tiền đã cọc và số tiền sắp cọc
            decimal totalDepositAfterThisPayment = order.DepositAmount + request.Amount;

            // 3. So sánh với số tiền cọc yêu cầu
            if (totalDepositAfterThisPayment > order.RequiredDepositAmount)
            {
                decimal remainingAmount = order.RequiredDepositAmount.Value - order.DepositAmount;
                return Result.Error($"Deposit amount exceeds the required amount. You only need to deposit {remainingAmount:N0} VND more.");
            }

            order.DepositAmount = totalDepositAfterThisPayment;

            // Dùng thời gian của server để cập nhật
            order.UpdatedAt = DateTimeHelper.UtcNow();

            await _db.SaveChangesAsync(ct);

            return Result.Success(order.SalesDocId);
        }
    }
}
