using Ardalis.Result;
using AutoMapper;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.CompleteDelivery
{
    public record CompleteDeliveryCommand(CompleteDeliveryRequest Request) : IRequest<Result<CompleteDeliveryResponse>>;

    public class CompleteDeliveryHandler : IRequestHandler<CompleteDeliveryCommand, Result<CompleteDeliveryResponse>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CompleteDeliveryHandler(
            EVDmsDbContext dbContext,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<CompleteDeliveryResponse>> Handle(CompleteDeliveryCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            //Kiểm tra đơn hàng có tồn tại không
            var order = await _dbContext.Orders
                .Include(o => o.Inventories)
                .FirstOrDefaultAsync(o => o.OrderId == req.OrderId && o.DealerId == dealerId, ct);

            if (order == null)
            {
                return Result.NotFound($"Order {req.OrderId} not found or does not belong to your dealer");
            }

            //Kiểm tra đơn hàng đã có VIN đã allocate
            var allocatedVins = order.Inventories.Where(i => i.Status == "Allocated").ToList();

            if (!allocatedVins.Any())
            {
                return Result.Error("Order must be allocated VIN before completing delivery");
            }

            // Kiểm tra trạng thái đơn hàng phải là "Ready" (đã đặt lịch giao hàng)
            if (order.Status != OrderStatus.Ready.ToString())
            {
                return Result.Error($"Order status must be 'Ready' to complete delivery");
            }

            //Kiểm tra đơn hàng chưa được giao
            if (order.Status == OrderStatus.Delivered.ToString())
            {
                return Result.Error("Order has already been delivered");
            }

            //Cập nhật thông tin bàn giao cho đơn hàng
            var actualDeliveryTime = req.ActualDeliveryTime ?? DateTime.UtcNow;

            order.DeliveredAt = actualDeliveryTime;
            order.DeliveryDocUrl = null;
            order.Status = OrderStatus.Delivered.ToString();
            order.UpdatedAt = DateTime.UtcNow;

            //Cập nhật trạng thái VIN thành "Delivered"
            foreach (var vin in allocatedVins)
            {
                vin.Status = "Delivered";
            }

            //Lưu thay đổi vào database với transaction
            using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
            try
            {
                await _dbContext.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                return Result.Error($"Failed to complete delivery: {ex.Message}");
            }

            var now = DateTime.UtcNow;
            var response = new CompleteDeliveryResponse
            {
                OrderId = order.OrderId,
                Status = "Delivered",
                DeliveredAt = DateTimeHelper.ToVietnamTime(actualDeliveryTime),
                Notes = req.Notes,
                CompletedAt = DateTimeHelper.ToVietnamTime(now),
                Message = "Đơn hàng đã được bàn giao thành công"
            };

            return Result.Success(response);
        }
    }
}
