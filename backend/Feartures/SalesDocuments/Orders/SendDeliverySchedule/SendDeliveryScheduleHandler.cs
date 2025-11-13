using Ardalis.Result;
using backend.Common.Auth;
using backend.Infrastructure.Data;
using backend.Infrastructure.Email;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.SendDeliverySchedule
{
    public record SendDeliveryScheduleCommand(SendDeliveryScheduleRequest Request) : IRequest<Result<bool>>;

    public class SendDeliveryScheduleHandler : IRequestHandler<SendDeliveryScheduleCommand, Result<bool>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailService _emailService;

        public SendDeliveryScheduleHandler(
            EVDmsDbContext dbContext,
            IHttpContextAccessor httpContextAccessor,
            IEmailService emailService)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
            _emailService = emailService;
        }

        public async Task<Result<bool>> Handle(SendDeliveryScheduleCommand cmd, CancellationToken ct)
        {
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            if (dealerId == null)
            {
                return Result.Error("Dealer ID not found in token");
            }

            var orderId = cmd.Request.OrderId;

            var order = await _dbContext.Orders
                .Include(o => o.Customer)
                .Include(o => o.Dealer)
                .Include(o => o.Branch)
                .Include(o => o.Inventories)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(
                    o => o.OrderId == orderId && o.DealerId == dealerId,
                    ct);

            if (order == null)
            {
                return Result.NotFound($"Order {orderId} not found or does not belong to your dealer");
            }

            if (!order.ScheduledDeliveryDate.HasValue)
            {
                return Result.Error("Đơn hàng chưa được lên lịch giao xe. Vui lòng lên lịch trước khi gửi email.");
            }

            if (order.Customer == null || string.IsNullOrWhiteSpace(order.Customer.Email))
            {
                return Result.Error("Không thể gửi email vì khách hàng chưa có địa chỉ email. Vui lòng cập nhật thông tin khách hàng.");
            }

            try
            {
                var subject = DeliveryScheduleEmailTemplate.GetEmailSubject(order);
                var htmlBody = DeliveryScheduleEmailTemplate.BuildEmailBody(order);

                await _emailService.SendEmailAsync(
                    order.Customer.Email,
                    order.Customer.FullName,
                    subject,
                    htmlBody,
                    ct);

                return Result.Success(true);
            }
            catch (Exception ex)
            {
                return Result.Error($"Không thể gửi email lịch giao xe: {ex.Message}");
            }
        }
    }
}

