using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.CancelOrder;

public sealed class CancelOrderHandler : IRequestHandler<CancelOrderCommand, Result>
{
    private readonly EVDmsDbContext _db;

    public CancelOrderHandler(EVDmsDbContext db) => _db = db;

    public async Task<Result> Handle(CancelOrderCommand request, CancellationToken ct)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o =>
                o.OrderId == request.OrderId &&
                o.DealerId == request.DealerId, ct);

        if (order is null)
        {
            return Result.NotFound($"Không tìm thấy Đơn hàng #{request.OrderId}.");
        }

        // Only allow cancel for Draft orders
        if (order.Status != OrderStatus.Draft.ToString())
        {
            return Result.Error($"Không thể hủy đơn hàng có trạng thái là '{order.Status}'. Chỉ có thể hủy đơn hàng ở trạng thái nháp.");
        }

        order.Status = OrderStatus.Canceled.ToString();
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}

