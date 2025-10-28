using Ardalis.Result;
using AutoMapper;
using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.ScheduleDelivery
{
    public record ScheduleDeliveryCommand(ScheduleDeliveryRequest Request) : IRequest<Result<ScheduleDeliveryResponse>>;

    public class ScheduleDeliveryHandler : IRequestHandler<ScheduleDeliveryCommand, Result<ScheduleDeliveryResponse>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ScheduleDeliveryHandler(
            EVDmsDbContext dbContext,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<ScheduleDeliveryResponse>> Handle(ScheduleDeliveryCommand cmd, CancellationToken ct)
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

            // Kiểm tra đơn hàng đã có VIN và trạng thái VIN là Allocated
            var allocatedVins = order.Inventories.Where(i => i.Status == "Allocated").ToList();

            if (!allocatedVins.Any())
            {
                return Result.Error("Order must have allocated VINs before scheduling delivery");
            }

            // Kiểm tra trạng thái đơn hàng
            if (order.Status != OrderStatus.Allocated.ToString())
            {
                return Result.Error($"Order status must be 'Allocated' to schedule delivery. Current status: {order.Status}");
            }

            // Kiểm tra ngày giao hàng không được trong quá khứ
            if (req.DeliveryDate.Date < DateTime.Today)
            {
                return Result.Error("Delivery date cannot be in the past");
            }

            // Kiểm tra đơn hàng chưa có lịch giao hàng
            if (order.DeliveredAt.HasValue)
            {
                return Result.Error("Order has already been delivered");
            }

            //Cập nhật thông tin giao hàng cho đơn hàng
            order.ScheduledDeliveryDate = req.DeliveryDate;
            order.DeliveryAddress = req.DeliveryAddress;
            order.DeliveryContactPhone = req.ContactPhone;
            order.ReceiverName = req.ContactName;
            order.Status = OrderStatus.Ready.ToString();
            order.UpdatedAt = DateTime.UtcNow;

            // BƯỚC 7: Lưu thay đổi vào database
            await _dbContext.SaveChangesAsync(ct);

            // BƯỚC 8: Tạo response
            var response = new ScheduleDeliveryResponse
            {
                OrderId = order.OrderId,
                DeliveryDate = req.DeliveryDate,
                DeliveryTimeSlot = req.DeliveryTimeSlot,
                DeliveryAddress = req.DeliveryAddress,
                ContactPhone = req.ContactPhone,
                ContactName = req.ContactName,
                Notes = req.Notes,
                ScheduledAt = DateTime.UtcNow,
                Status = "Ready"
            };

            return Result.Success(response);
        }
    }
}
