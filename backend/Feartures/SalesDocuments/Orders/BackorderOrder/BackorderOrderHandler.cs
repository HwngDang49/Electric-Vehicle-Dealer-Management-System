using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.BackorderOrder
{
    public class BackorderOrderHandler : IRequestHandler<BackorderOrderCommand, Result<string>>
    {
        private readonly EVDmsDbContext _db;

        public BackorderOrderHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<string>> Handle(BackorderOrderCommand request, CancellationToken ct)
        {
            var order = await _db.Orders
                .FirstOrDefaultAsync(o => o.OrderId == request.OrderId, ct);

            if (order == null)
            {
                return Result.NotFound($"Order {request.OrderId} not found");
            }

            // Kiểm tra trạng thái hợp lệ để backorder
            if (order.Status != OrderStatus.Confirmed.ToString())
            {
                return Result.Error($"Only Confirmed orders can be backordered. Current status: {order.Status}");
            }

            // Cập nhật status sang Backordered
            order.Status = OrderStatus.Backordered.ToString();
            order.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            return Result.Success($"Order {request.OrderId} has been moved to Backordered status");
        }
    }
}

