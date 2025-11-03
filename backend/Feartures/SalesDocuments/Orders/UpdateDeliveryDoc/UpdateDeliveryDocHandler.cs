using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.UpdateDeliveryDoc
{
    public record UpdateDeliveryDocCommand(UpdateDeliveryDocRequest Request) : IRequest<Result<UpdateDeliveryDocResponse>>;

    public class UpdateDeliveryDocHandler : IRequestHandler<UpdateDeliveryDocCommand, Result<UpdateDeliveryDocResponse>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateDeliveryDocHandler(
            EVDmsDbContext dbContext,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<UpdateDeliveryDocResponse>> Handle(UpdateDeliveryDocCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            // Kiểm tra đơn hàng có tồn tại không
            var order = await _dbContext.Orders
                .FirstOrDefaultAsync(o => o.OrderId == req.OrderId && o.DealerId == dealerId, ct);

            if (order == null)
            {
                return Result.NotFound($"Order {req.OrderId} not found or does not belong to your dealer");
            }

            // Kiểm tra trạng thái đơn hàng phải là "Ready" (đã đặt lịch giao hàng)
            if (order.Status != OrderStatus.Ready.ToString())
            {
                return Result.Error($"Order status must be 'Ready' to update delivery document. Current status: {order.Status}");
            }

            // Chỉ cập nhật DeliveryDocUrl, không đổi status
            order.DeliveryDocUrl = req.DeliveryDocUrl;
            order.UpdatedAt = DateTime.UtcNow;

            // Lưu thay đổi vào database
            try
            {
                await _dbContext.SaveChangesAsync(ct);
            }
            catch (Exception ex)
            {
                return Result.Error($"Failed to update delivery document: {ex.Message}");
            }

            var now = DateTime.UtcNow;
            var response = new UpdateDeliveryDocResponse
            {
                OrderId = order.OrderId,
                DeliveryDocUrl = req.DeliveryDocUrl,
                UpdatedAt = DateTimeHelper.ToVietnamTime(now),
                Message = "Đã cập nhật tài liệu bàn giao xe thành công"
            };

            return Result.Success(response);
        }
    }
}

